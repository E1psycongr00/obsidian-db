import {hello} from "./lib/hello";
function add(a: number, b: number) {
    hello();
    return a + b;
}

export {add};