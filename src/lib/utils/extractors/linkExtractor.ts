import { Root } from "remark-gfm";


interface LinkExtractor {
    extract: (ast: Root) => string[];
}



export default LinkExtractor;