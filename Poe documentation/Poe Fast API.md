# creator.poe.com - July27
**URL**: https://creator.poe.com/docs/server-bots/fastapi_poe-python-reference
**Downloaded**: July 27, 2025 at 15:57
**Domain**: creator.poe.com

---

Title: fastapi_poe: Python API Reference | Poe Creator Platform

URL Source: https://creator.poe.com/docs/server-bots/fastapi_poe-python-reference

Published Time: Sun, 27 Jul 2025 02:48:54 GMT

Markdown Content:
The following is the API reference for the [fastapi_poe](https://github.com/poe-platform/fastapi_poe) client library. The reference assumes that you used `import fastapi_poe as fp`.

`fp.PoeBot`
------------------------------------------------------------------------------------------------------------------------

The class that you use to define your bot behavior. Once you define your PoeBot class, you

pass it to `make_app` to create a FastAPI app that serves your bot.

#### Parameters:

*   `path` (`str = "/"`): This is the path at which your bot is served. By default, it's

set to "/" but this is something you can adjust. This is especially useful if you want to serve

multiple bots from one server.
*   `access_key` (`Optional[str] = None`): This is the access key for your bot and when

provided is used to validate that the requests are coming from a trusted source. This access key

should be the same one that you provide when integrating your bot with Poe at:

[https://poe.com/create_bot?server=1](https://poe.com/create_bot?server=1). You can also set this to None but certain features like

file output that mandate an `access_key` will not be available for your bot.
*   `should_insert_attachment_messages` (`bool = True`): A flag to decide whether to parse out

content from attachments and insert them as messages into the conversation. This is set to

`True` by default and we recommend leaving on since it allows your bot to comprehend attachments

uploaded by users by default.
*   `concat_attachments_to_message` (`bool = False`): **DEPRECATED**: Please set

`should_insert_attachment_messages` instead.

### `PoeBot.get_response`

Override this to define your bot's response given a user query.

#### Parameters:

*   `request` (`QueryRequest`): an object representing the chat response request from Poe.

This will contain information about the chat state among other things.

#### Returns:

*   `AsyncIterable[PartialResponse]`: objects representing your

response to the Poe servers. This is what gets displayed to the user.

Example usage:

`async def get_response(self, request: fp.QueryRequest) -> AsyncIterable[fp.PartialResponse]:    last_message = request.query[-1].content    yield fp.PartialResponse(text=last_message)`
