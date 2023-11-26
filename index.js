const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = 3000; // Your desired port number

// Middleware to parse JSON requests
app.use(express.json());

// Set up Google OAuth credentials
const credentials = require('./credentials.json');
const { client_id, client_secret, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive'] // Adjust scopes as needed
});


// Middleware to check API key in incoming requests
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Apply API key check middleware to all routes except /auth and /oauth2callback
app.use((req, res, next) => {
  const path = req.path.toLowerCase();
  if (path !== '/auth' && path !== '/oauth2callback') {
    checkApiKey(req, res, next);
  } else {
    next();
  }
});



// Redirect to the authorization URL
app.get('/auth', (req, res) => {
  res.redirect(authUrl);
});

// Handle the redirect after authorization
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.send('Authorization successful! You can now use the API.');
  } catch (error) {
    res.status(500).send('Authorization failed.');
  }
});

// Set up permissions for a Google Doc
async function setDocPermissions(docId, emailIds, permissionType) {
    try {
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  
      const allPermissions = await drive.permissions.list({
        fileId: docId,
        fields: 'permissions(id, emailAddress, role)',
      });
      //log
      //console.log(allPermissions.data.permissions)
  
      const permissionsToUpdate = allPermissions.data.permissions.filter((permission) =>
        emailIds.includes(permission.emailAddress)
      );
  
      await Promise.all(
        permissionsToUpdate.map(async (permission) => {
          try {
            await drive.permissions.update({
              fileId: docId,
              permissionId: permission.id,
              requestBody: { role: permissionType },
              fields: 'id',
            });
          } catch (error) {
            console.error('Error updating permissions:', error);
            throw error;
          }
        })
      );
  
      // For emails without existing permissions, add new permissions
      const existingEmails = permissionsToUpdate.map((permission) => permission.emailAddress);
      const newEmails = emailIds.filter((email) => !existingEmails.includes(email));
  
      await Promise.all(
        newEmails.map(async (email) => {
          try {
            await drive.permissions.create({
              fileId: docId,
              requestBody: {
                type: 'user',
                role: permissionType,
                emailAddress: email,
              },
              fields: 'id',
            });
          } catch (error) {
            console.error('Error creating permissions:', error);
            throw error;
          }
        })
      );
  
      return 'Permissions updated successfully!';
    } catch (error) {
      console.error('Error setting permissions:', error);
      throw error;
    }
  }

// Function to create a new Google Doc and set permissions
async function createDocWithPermissions(emailIds, permissionType) {
    try {
      const docMetadata = {
        name: 'New Google Doc', // Adjust the document name as needed
        mimeType: 'application/vnd.google-apps.document',
      };
  
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  
      // Create a new Google Doc
      const newDoc = await drive.files.create({
        resource: docMetadata,
        fields: 'id',
      });
  
      const newDocId = newDoc.data.id;
  
      // Set permissions for the created Google Doc
      await Promise.all(
        emailIds.map(async (email) => {
          try {
            await drive.permissions.create({
              fileId: newDocId,
              requestBody: {
                type: 'user',
                role: permissionType,
                emailAddress: email,
              },
              fields: 'id',
            });
          } catch (error) {
            console.error('Error setting permissions:', error);
            throw error;
          }
        })
      );
  
      return `New Google Doc created with ID: ${newDocId}`;
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      throw error;
    }
  }



// API endpoint to set permissions
app.post('/set-permissions', async (req, res) => {
  const { docId, emailIds, permissionType } = req.body;

  try {
    const result = await setDocPermissions(docId, emailIds, permissionType);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set permissions' });
  }
});

// API endpoint to create a new Google Doc and set permissions
app.post('/create-doc', async (req, res) => {
    const { emailIds, permissionType } = req.body;
  
    try {
      const result = await createDocWithPermissions(emailIds, permissionType);
  
      res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create Google Doc and set permissions' });
    }
  });


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
