# Hunter - Shin Sekai

![Hunter Icon](./src/assets/icons/icon-128.png)

**Hunter** is a Chrome Extension built with **Vue 3** that helps you create powerful extractors based on **XPath** for web scraping.  
It provides an easy and efficient way to generate XPath expressions automatically or inspect and copy them manually.

---

## Features

- **Auto Scraping**  
  Automatically generates XPath for **all elements** on a webpage.
  
- **Inspector**  
  Works like a browser inspector: when you select an element, the XPath is instantly copied to your clipboard.

---

## How it Works

- The extension injects scripts into web pages to **automatically** generate or **manually** copy XPaths.
- You can open the **popup window** to manage your scrapes and logs.
- All generated data is stored locally using Chrome's `storage` API.

---

## Build & Install

1. Clone the repository:

```bash
git clone
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Load the `dist/` folder as an **unpacked extension** in Chrome:

- Go to `chrome://extensions`
- Enable **Developer Mode**
- Click **Load unpacked**
- Select the `dist/` directory

---

## Technologies Used

- **Vue 3**  
- **Vite**  
- **Chrome Extension Manifest v3**  
- **TypeScript** (for background and core services)

---

## Author

**Hakken**  
*"Good hunter =)"*

---

## License

This project is released into the public domain under [The Unlicense](LICENSE).

---

### Notes

- Hunter is intended for educational and personal use.  
- Always respect websites' **robots.txt** and **terms of service** when scraping data.

---