## Description

-----------------------------

Dovetail Transcript Export it is a Google Chrome extension that allows you to export your Dovetail transcript directly
into the Fibery rich-text field.

### Currently supported features:

- [x] Automatic checking out for appropriate transcript available

- [x] Export Dovetail transcript via Markdown to Fibery rich-text

- [x] User's custom Fibery access token (for proper entity changelog)

- [x] Export to Entity (now Customer Feedback/Conversation only) by its public id

- [x] Storing of each User's Fibery access token independently between sessions and devices

- [x] Custom error messages

### Installation

1. Download the last extension version (archive) from
   the [Releases page](https://github.com/infludb-inc/dovetail-export/releases "https://github.com/infludb-inc/dovetail-export/releases")

2. Unpack this archive wherever you want on your PC

3. Navigate to [chrome://extensions]( chrome://extensions " chrome://extensions") page

4. Click `Developer Mode` at the top right corner of the page

   ![Screenshot 2022-05-05 at 21.51.14.png](files/d2b748e8-515e-47c0-8f23-2f5de0bedc8d.png "")

5. Select the `Load Unpacked` option

   ![Screenshot 2022-05-05 at 21.51.22.png](files/d0753310-7382-4059-962f-b2cd5e6ef662.png "")

6. Choose the folder where you unpacked your download

7. Pin the extension to your Chrome toolbar as shown below

   ![Screenshot 2022-05-05 at 21.55.49.png](files/04a4085a-803c-49e6-a859-94d968183604.png "")

### Usage

1. Navigate to opened Dovetail interview page with non-empty transcript
2. Click to extension icon and popup window should look like one below
   ![Screenshot 2022-05-05 at 22.03.49.png](files/cd139536-29c8-4e32-ae98-fdc4d40263c0.png)
3. Paste your Fibery access token. After you paste it, it will be remembered and you don't have to paste it again.
[How to obtain Fibery access token](https://api.fibery.io/#generate-a-new-token)
4. Paste public id of Conversation entity from Customer Development space
5. Click "Export Transcript"
