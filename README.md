# Google Drive API Permissions Setter

This project provides an API to manage permissions for Google Drive documents. It allows users to update permissions for existing documents or create new Google Docs with specified permissions.

## Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/iqbalpb/google-docs-permission-app.git
    ```

2. **Install Dependencies**
    ```bash
    cd google-docs-permission-app
    npm install
    ```
3. **Adding Google API Credentials**

To enable Google Drive API functionality in this project, follow these steps:

   - Obtain the credentials.json file from the Google Developer Console for your project.

   - Place the downloaded credentials.json file into the root directory of this project.

4. **Environment Variables**
    - Create a `.env` file in the root directory following the `example.env` provided.
    - Add your actual API keys and other necessary environment variables.

5. **Start the Server**
    ```bash
    npm start
    ```

## Usage

### Endpoints

- **Authenticating**
    - `GET /auth`: Visit this endpoint to authorize the application.
    - `GET /oauth2callback`: Redirect URL after successful authorization. (set this URL in cloud console properly)

- **Setting Permissions**
    - `POST /set-permissions`: Update permissions for a Google Doc by providing `docId`, `emailIds`, and `permissionType`.

- **Creating a New Google Doc with Permissions**
    - `POST /create-doc`: Create a new Google Doc and set permissions by providing `emailIds` and `permissionType`.

### Example `curl` Commands

#### Authenticate:
```bash
curl http://localhost:3000/auth
```

#### Set Permissions: (example)

```bash
curl -X POST -H "Content-Type: application/json" -H "x-api-key: YOUR_API_KEY" -d '{
  "docId": "your_document_id",
  "emailIds": ["email1@example.com", "email2@example.com"],
  "permissionType": "writer"
}' http://localhost:3000/set-permissions`
```
#### Create New Doc with Permissions: (example)
```bash
curl -X POST -H "Content-Type: application/json" -H "x-api-key: YOUR_API_KEY" -d '{
  "emailIds": ["email1@example.com", "email2@example.com"],
  "permissionType": "writer"
}' http://localhost:3000/create-doc
```
### Security

API key protection has been implemented. Ensure that the x-api-key header with a valid API key is provided in requests.

### License

This project is licensed under the [MIT](./LICENSE) License.

#### Author

###### Jinso Raj - [t.me/JinsoRaj](https://telegram.dog/JinsoRaj)