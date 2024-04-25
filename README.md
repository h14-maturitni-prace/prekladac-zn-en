# Zn-en_#3

Zn-en_#3 is a web-based translator application designed to translate text from Chinese (Simplified) to English. It aims to provide users with a simple, efficient, and accurate tool for translating texts up to 1000 characters, making it suitable for both personal and professional use.

## Overview

The application utilizes a combination of Node.js with the Express framework for backend operations, while the frontend is developed using Vanilla JavaScript and styled with Bootstrap. EJS is used as the templating engine. The core of its translation capability is powered by the integration with the Helsinki-NLP/opus-mt-zh-en model via the Hugging Face API. This setup allows for a responsive and user-friendly interface.

## Features

- **Two Text Areas**: For inputting Chinese text and displaying the English translation.
- **Translate Button**: To initiate the translation.
- **Loading Indicator**: Visual feedback during translation processing.
- **Character Limit Warning**: Alerts if the input exceeds 1000 characters.
- **Chunk Processing**: Enhances accuracy and manages processing load by splitting text into chunks.

## Getting started

### Requirements

- Node.js
- MongoDB
- An active internet connection for Hugging Face API integration

### Quickstart

1. Clone the repository to your local machine.
2. Create a `.env` file based on `.env.example` and fill in the necessary environment variables.
3. Install dependencies with `npm install`.
4. Run the app using `npm start`. The server will start on the configured port, defaulting to 3000 if unspecified.

## How It Works

Zn-en_#3 simplifies the process of translating text from Chinese (Simplified) to English through a user-friendly web interface. The application accepts input text, processes it through a sophisticated backend involving chunking for load management and accuracy, and then utilizes the Helsinki-NLP model for translation. 

For a detailed step-by-step explanation of how Zn-en_#3 operates, from the user input to the backend processing and the translation model interaction, please refer to the [howItWorks.md](./howItWorks.md) file. This documentation aims to provide transparency into the application's functionality and serve as a valuable resource for new developers or users interested in understanding the inner workings of Zn-en_#3.

### License

Copyright (c) 2024.