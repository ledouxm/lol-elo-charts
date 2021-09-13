## Client:

-   CommandList available restricted by client.roles
-   RoomClientsTable dynamic state/meta columns
-   AppMonitor big todo
-   group atoms so that fast-refresh still works fine
-   toast forbidden/error everywhere ?

## Server:

-   presence.get/getMeta specific fields like rooms.update
-   presence/rooms -> get current list of own joined rooms
-   presence.get meta for multiple clients, return array
-   uniformiser les réponses errors ws
-   valtio/vanilla server side pour computed props/auto emit on change ? client.meta.rooms = ["name1", "name2"] auto computed from client.rooms

## Misc:

-   ObjectLiteral faire comme MapObject et pouvoir passer un partial obj
