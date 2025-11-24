# Card

## Add

```mermaid
sequenceDiagram
    participant User
    participant FrontEnd
    participant Backend

    User ->> FrontEnd: click the Add Card button
    FrontEnd ->> User: show Add Card pane

    User ->> FrontEnd: add text to the Front text box, select a phrase and click the Add Word To Card button
    FrontEnd ->> FrontEnd: add number sign on both sides of the word in the `front_text`
    FrontEnd ->> User: show Word Suggestion List list
    User ->> FrontEnd: select one of the suggested words
    FrontEnd ->> FrontEnd: add the word to the `words` list
    FrontEnd ->> User: show Add Card pane (again)

    User ->> FrontEnd: click the Add button
    FrontEnd ->> Backend: `createCard`
    Backend ->> Backend: sanitize `front_text`, add row in `card` table
    Backend ->> FrontEnd: `card`
    FrontEnd ->> Backend: `addWordsToCard`
    Backend ->> FrontEnd: 200 OK

    FrontEnd ->> User: show Add Card pane
```

- user add text to the `Front` text box
- user select a word/phrase and click the `Add Word to Card` button (below the `Front` text box)
  - client adds `#` on both sides of the word in the front text (for highlighting)
  - client shows the `Word Suggestion List` below the `Add Word to Card` button with:
    - search field (editable)
    - result (populated with `searchWord` full-text search)
  - user selects one of the suggested words
    - client adds the word to the `words` list
  - click the `Add New Word` button instead
    - the `Add New Word` dialog is shown
    - enter word info and click `Add`
      - `createWord` is called
      - the word is added to `createCard` request body
- upload front audio (optional)
  - `uploadAudio` is called
  - the audio_uri is added to `createCard` request body
- user clicks the `Add` button
  - the front text is added to `createCard` request body
  - clients calls the rpc `createCard`
    - front text is sanitized (e.g. html tags are not allowed) to prevent XSS, etc.
    - row is added to `card` table
  - after `createCard` returns successfully, `addWordsToCard` is called
    - rows are added to `card_word` table
