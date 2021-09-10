## Client:

-   CommandList available restricted by client.roles
-   RoomClientsTable actions + dynamic state/meta columns
-   AppMonitor big todo + ClientActionMenu onClick's
-   group atoms so that fast-refresh still works fine
-   toast forbidden/error everywhere ?

## Server:

-   rename client/user/sessions using Naming section in README
-   presence.get/getMeta specific fields like rooms.update
-   presence/rooms -> get current list of own joined rooms
-   presence.get meta for multiple clients, return array
-   uniformiser les réponses errors ws
