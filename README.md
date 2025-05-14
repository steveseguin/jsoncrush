# JSON Crush

A lightweight, browser-based tool for cleaning and shortening JSON data.

![image](https://github.com/user-attachments/assets/5b524440-5d38-40c8-a6fb-882388d8198b)

DEMO: [https://github.com/steveseguin/jsoncrush](https://github.com/steveseguin/jsoncrush)

## Features

- **Base64 Detection & Shortening**: Automatically finds base64-encoded data and replaces it with a shortened placeholder
- **URL Shortening**: Trims long query parameters and hash fragments while preserving domains and paths
- **Long Text Truncation**: Automatically abbreviates text fields longer than a configurable length
- **Fully Customizable**: Configure detection patterns and preservation lengths
- **Works Offline**: Runs entirely in your browser without sending data to any server
- **Zero Dependencies**: Pure JavaScript with no external libraries required

## Usage

1. Paste your JSON into the input area
2. Configure your shortening preferences:
   - **Base64 preserve chars**: How many characters to keep from base64 data
   - **Base64 pattern**: Regular expression to identify base64 content
   - **Max text length**: Length at which to truncate normal text strings
   - **Max URL param length**: How many characters to keep in URL parameters/fragments
3. Click "Process JSON"
4. Copy the result using the "Copy Result" button

## Why Use This?

JSON data often contains long strings that make debugging difficult:

- **Base64-encoded images and binary data**: Makes JSON logs/files enormous and hard to read
- **Long URL parameters**: Creates noise when you only need to see the main URL structure
- **Verbose text fields**: Can hide the important data structure

This tool maintains your JSON structure while making it much more readable and manageable.

## Use Cases

- **API Development**: Clean response data for documentation or debugging
- **Log Analysis**: Make JSON logs more readable by condensing verbose fields
- **Data Inspection**: Quickly understand complex JSON structures without noise
- **Content Management**: Inspect CMS JSON exports without being overwhelmed by encoded media

## How It Works

The tool recursively traverses your JSON and applies three types of shortening:

1. **Base64**: Identifies base64 patterns (including in data URIs) and shortens them to `base64:AbCd...`
2. **URLs**: Parses URLs and shortens query parameters and hash fragments while preserving the main URL
3. **Long Text**: Truncates any text longer than your specified maximum length

## Installation

Simply download the HTML file and open it in any modern browser. No server required.

```
git clone https://github.com/steveseguin/jsoncrush.git
cd json-shortener
open index.html
```

## License

MIT
