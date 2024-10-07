# Nuxt 3 Minimal Starter

Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on http://localhost:3000

Create file .env in project's root directory.

.env example:

```txt
KEYCLOAK_URL='https://stage-auth.finmars.com'
KEYCLOAK_REALM='finmars'
KEYCLOAK_CLIENT_ID='finmars'

APP_HOST='http://localhost:3000/v'
API_HOST='https://stage.finmars.com'
AUTH_HOST='https://stage.finmars.com/authorizer'

OLD_APP_URL='http://0.0.0.0:8080/#!/'
NUXT_HOST='localhost'
```

Run command:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment) for more information.
