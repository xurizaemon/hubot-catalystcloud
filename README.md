# Hubot Catalyst Cloud

Catalyst Cloud functionality for Hubot

Relays / fetches status page to channel. Suggestions for other functionality welcome. See also [hubot-openstack](https://github.com/willgarcia/hubot-openstack) for OpenStack functionality.

## Installation

In hubot project repo, run:

`npm install hubot-catalystcloud --save` (@todo)

Then add **hubot-wrms** to your `external-scripts.json`:

```json
[
  "hubot-catalystcloud"
]
```

## Configuration

    HUBOT_CATALYSTCLOUD_STATUS_URL=https://catalystcloud.nz/support/status/
    HUBOT_CATALYSTCLOUD_STATUS_ANNOUNCE=1          # Set to false or 0 to disable)
    HUBOT_CATALYSTCLOUD_STATUS_ROOMS=bofh,catalyst # Rooms to announce cloud status to
    HUBOT_CATALYSTCLOUD_STATUS_NOTIFY_INTERVAL=60  # Seconds between checks
    HUBOT_CATALYSTCLOUD_STATUS_IGNORE=/(zombie)/   # Regex of keys / values to ignore (@TODO)

## Usage

Hubot will now announce changes in Catalyst Cloud status as seen from the status page.

You can also ask: `@hubot cloud status` and Hubot will reply with a full list of statuses.
