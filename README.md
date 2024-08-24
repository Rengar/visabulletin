
# Visa Bulletin Scraper & Notifier

This script scrapes the latest Visa Bulletin information from the U.S. Department of State website and automatically sends updates to a specified Telegram chat using a bot. The information includes region-specific cut-off dates for visa processing and any applicable exceptions.

## Features

- Scrapes the official Visa Bulletin data.
- Automatically sends updates to your Telegram chat.
- Handles monthly updates and stores current state in a configuration file.
- Includes region-specific cut-off dates and exceptions.
- Automatically handles monthly/yearly transitions.

### Telegram Bot

You can also check out the official bot that demonstrates this functionality: [Visa Bulletin DV](https://t.me/visabulletin_dv).

## Usage

### Prerequisites

To run this script, you need to have:

- [Node.js](https://nodejs.org/) installed.
- `npm` (Node package manager) installed.
- A Telegram bot token. You can get one by talking to [BotFather](https://core.telegram.org/bots#botfather) on Telegram.

### Installation

1. Clone the repository:

2. Install the dependencies (this step assumes the `package.json` is already set up):

   ```bash
   npm install
   ```

3. Edit the `config.json` file:

   Open the `config.json` file in the root of the project and enter your own data, such as:

   - **`telegram_bot_key`**: Your Telegram bot API key from BotFather.
   - **`telegram_chat_ids`**: Array of chat IDs where you want to send updates. You can get your chat ID by messaging your bot and checking the bot response (e.g., using an API to retrieve chat data).
   - **`current_month`**: The current month (0 = January, 11 = December).
   - **`current_year`**: The current fiscal year.

### Running the Script

To run the Visa Bulletin scraper and notifier:

```bash
node vb.js
```

The script will periodically check the Visa Bulletin page and send a message to your Telegram chat when new data is available.

### Example Output in Telegram

```
📊 September Visa Bulletin came out. FY24 📊

Region | Cut-off:
AFRICA: CURRENT
ASIA: 27500
EUROPE: 50000
NORTH AMERICA: CURRENT
OCEANIA: 2700
SA And CARIBBEAN: 5000

📍 October Visa Bulletin. FY25 📍

Region | Cut-off
AFRICA: 15000 
ASIA: 3000
EUROPE: 6000
NORTH AMERICA: 2 
OCEANIA: 500
SA And CARIBBEAN: 825

⭕️ Excepts ⭕️

AFRICA:
ALGERIA    6,500
EGYPT       8,250
MOROCCO  8,250

ASIA:
IRAN       2,950
NEPAL    2,950

EUROPE:
RUSSIA           5,950
UZBEKISTAN    4,900
```
