<p align="center">
  <img src="./src/favicon.png" alt="AcademiaOS logo" width="50"/>
</p>
<h1 align="center">AcademiaOS</h1>

Welcome to **AcademiaOS**, your one-stop solution for academic information retrieval and reasoning! We've built this on a robust large language model platform equipped with a bouquet of features dedicated to providing the best assistance for researchers possible.

For a deeper understanding of the underlying technology and concepts, you can refer to our paper: [AcademiaOS: Automating Grounded Theory Development in Qualitative Research with Large Language Models](https://arxiv.org/abs/2403.08844).

<p align="center">
    <img src="public\overview.gif"  alt="Demo" width="400"/>
</p>

Live-Demo: [academia-os.org](https://academia-os.org/)!

Join the [Slack Community](https://join.slack.com/t/academiaos/shared_invite/zt-23730lsp0-Qlkv_0Bs3hgMY2FGTC~HnQ)!
## 🌟 Features 

* **Find Academic Papers**: Building on the SemanticScholar corpus and OpenAI embeddings, AcademiaOS finds and ranks relevant papers to your search queries. 
* **Upload PDFs**: If you have curated papers or other qualitative documents (such as interview transcripts) as PDFs, you can upload them for downstream tasks. Text-PDFs are handled in-browser while scanned PDFs are OCRd using Adobe PDF Extract API.
* **Mass Information Extraction**: Structurally extract information (such as a paper's sentiment towards your thesis or information such as the count of study participants) from papers at scale.
* **Automated Literature Review**: Navigate with a clean and intuitive interface.
* **Coding of Qualitative Literature**: Let AI code your interviews, social media posts or other qualitative literature.
* **Automated Theory Construction**: Get a theoretical model explaining your qualitative data in just a few steps.

## 🔧 Getting Started 

Tech Stack:
- ReactJS
- AntDesign (Component Library)
- LangChainJS (Composability with Large Language Models)
- SemanticScholarJS (Interaction with Semantic Scholar)

To get started with AcademiaOS, you require [Node.js](https://nodejs.org/en/download) installed in your machine.

1. Use `git clone` to clone this repository. 
2. Run `npm install`.

## 👨‍💻 Development Mode  

### `npm start`

Initiates the application in the development mode.\
Use [http://localhost:3000](http://localhost:3000) to view the application on your browser.

The application reloads automatically if any edits are made.\
Any lint errors are visible in the console.

### `npm test`

Initiates the test runner in the interactive watch mode.\
Visit the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for further information.

## 🏭 Production Build 

### `npm run build`

Compiles the application for production into the `build` folder.\
Efficiently bundles React in the production mode and optimizes the build to deliver optimum performance.

The build is minified, and the filenames include the hashes.\
Your application is now ready for deployment!

Visit the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for an in-depth understanding.

## 💡 Contributing 

We eagerly look forward to your valuable contributions to the AcademiaOS project! Feel free to brainstorm ideas, recommend suggestions, or report bugs. You're always invited to open an issue or submit a pull request.

## ⚖️ License 

This endeavor is under the aegis of an open-source License. Refer to the [LICENSE](./LICENSE) file for detailed information.

----------

Crafted with passion and commitment by Thomas Übellacker❣️ Happy coding! ⌨️💡
