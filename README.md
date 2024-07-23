# punycode-convertor

Punycode-convertor is a JavaScript module designed for encoding and decoding internationalized domain names (IDNs) using the Punycode-convertor encoding scheme. Punycode-convertor allows Unicode characters to be represented using the ASCII character set supported by the Domain Name System (DNS).

## Installation

```bash
npm install punycode-convertor
```

## Features

-   **Domain Name Conversion**:
    -   Convert from Unicode to Punycode, supporting internationalized domain names.
    -   Convert from Punycode to Unicode, supporting internationalized domain names.

## Usage

The Punycode-convertor module provides straightforward functions to handle the conversion of domain names between Unicode and Punycode formats. Below are detailed examples illustrating how to use these functions in your JavaScript applications.

### Converting Domain Names

#### Unicode to Punycode

```js
const { unicodeToPunycode } = require('./punycode-convertor');

let domain = 'münchen.de';
let punycodeDomain = unicodeToPunycode(domain);
console.log(punycodeDomain); // Outputs "xn--mnchen-3ya.de"
```

#### Punycode to Unicode

```js
const { punycodeToUnicode } = require('./punycode-convertor');

let punycodeDomain = 'xn--mnchen-3ya.de';
let unicodeDomain = punycodeToUnicode(punycodeDomain);
console.log(unicodeDomain); // Outputs "münchen.de"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have any improvements or find any bugs.
