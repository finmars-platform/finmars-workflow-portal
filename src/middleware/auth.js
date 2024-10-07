export default defineNuxtRouteMiddleware(async (to, from) => {

	console.log("auth middleware?")

	try {
		let keycloak = await uKeycloak()

		if ( !keycloak.authenticated ) keycloak.login()

	} catch (e) {
		console.error("Keycloak error:", e);

		if (process.env.NODE_ENV === "development") {

			if (e.error === "Timeout when waiting for 3rd party check iframe message.") {

				console.error(
					"Check that your vpn is working and requests " +
					"are reaching the correct keycloak server");

			}

		}

		throw e;
	}

})
