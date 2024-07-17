# 🚀 Discord for GitHub Actions

Sends a Discord notification message. Simple as that.
Supports all [workflow event types](https://developer.github.com/webhooks/#events) by using the [Discord GitHub webhooks](https://discordapp.com/developers/docs/resources/webhook#execute-githubcompatible-webhook).

## Compatibility note

As this Action is containerized with Docker, [it can only run on Linux environments](https://help.github.com/en/actions/building-actions/about-actions#types-of-actions).

> Docker container actions can only execute in the GitHub-hosted Linux environment.
> Self-hosted runners must use a Linux operating system and have Docker installed to run Docker container actions. For more information about the requirements of self-hosted runners, see "About self-hosted runners."

<hr/>

## Usage

```yaml
- name: Discord notification
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  uses: step-security/action-discord@0.3.2
  with:
    args: "The project {{ EVENT_PAYLOAD.repository.full_name }} has been deployed."
```

### Arguments

By default, the GitHub action will send a notification with the event information. Providing the arguments will override the message.

**Environment variables** can be interpolated in the message using brackets (`{{` and `}}`) :

e.g.: `Action called : {{ GITHUB_ACTION }}`

**Event Payload** data can also be interpolated in the message using brackets (`{{` and `}}`) with the `EVENT_PAYLOAD` variable.

e.g.: `Action called: {{ GITHUB_ACTION }} as {{ EVENT_PAYLOAD.pull_request.id }}`

> See the [event types](https://developer.github.com/v3/activity/events/types) for valid payload information.

#### Examples

- `args = "Hello, beautiful ! I ran a GitHub Actions for you <3"`
- `args = "I showed you my commit. Please respond."`

### Environment variables

- **`DISCORD_WEBHOOK`** (**required**): the Discord webhook URL (see https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks).
  - **_IMPORTANT !!_ You MUST NOT append `/github` at the end of the webhook.**
- **`DISCORD_USERNAME`** (_optional_): overrides the bot nickname.
- **`DISCORD_AVATAR`** (_optional_): overrides the avatar URL.
- **`DISCORD_EMBEDS`** (_optional_): This should be a valid JSON string of an array of Discord `embed` objects. See the [documentation on Discord WebHook Embeds](https://birdie0.github.io/discord-webhooks-guide/structure/embeds.html) for more information. You can use set it to `${{ toJson(my_value) }}` using [`toJson()`](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#tojson) if your input is an object value.
- That's all.
