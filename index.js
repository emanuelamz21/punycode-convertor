// Punycode.js: A JavaScript module for encoding and decoding Punycode strings.
// This module provides functionality to handle internationalized domain names (IDNs) using Punycode encoding.
// Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.

// Constants used in the Punycode algorithm
const base = 36; // Base used for Punycode encoding
const tmin = 1; // Minimum value for the variable t
const tmax = 26; // Maximum value for the variable t
const skew = 38; // Skew for bias adaptation
const damp = 700; // Damping factor for bias adaptation
const initialBias = 72; // Initial bias for the adaptation
const initialN = 128; // Initial value of n (ASCII for 'a')
const delimiter = '-'; // Delimiter used in Punycode to separate encoded parts

/**
 * Converts a basic ASCII code point to a digit in the base-36 number system.
 * @param {number} codePoint - The ASCII code point.
 * @returns {number} The corresponding base-36 digit.
 */
function basicToDigit(codePoint) {
    if (codePoint >= 48 && codePoint <= 57) return codePoint - 22; // '0'-'9'
    if (codePoint >= 65 && codePoint <= 90) return codePoint - 65; // 'A'-'Z'
    if (codePoint >= 97 && codePoint <= 122) return codePoint - 97; // 'a'-'z'
    return base; // Should not reach here as input is validated beforehand
}

/**
 * Converts a digit in base-36 to a basic ASCII code point.
 * @param {number} digit - The base-36 digit.
 * @param {boolean} flag - Indicates lowercase if true.
 * @returns {number} The corresponding ASCII code point.
 */
function digitToBasic(digit, flag) {
    if (digit < 26) return digit + 65 + (flag ? 32 : 0);
    if (digit < 36) return digit + 22;
    throw new Error('Digit out of range'); // Ensure the digit is within the expected range
}

/**
 * Bias adaptation function as specified in RFC 3492.
 * @param {number} delta - Difference between the basic code points and the input code points.
 * @param {number} numPoints - Number of code points processed.
 * @param {boolean} firstTime - Indicates if it's the first character processed.
 * @returns {number} The adapted bias.
 */
function adapt(delta, numPoints, firstTime) {
    delta = firstTime ? Math.floor(delta / damp) : Math.floor(delta / 2);
    delta += Math.floor(delta / numPoints);

    let k = 0;
    while (delta > ((base - tmin) * tmax) / 2) {
        delta = Math.floor(delta / (base - tmin));
        k += base;
    }
    return k + Math.floor(((base - tmin + 1) * delta) / (delta + skew));
}

/**
 * Encodes a string to Punycode.
 * @param {string} input - The Unicode string to encode.
 * @returns {string} The Punycode representation of the input string.
 */
function encode(input) {
    let output = [];
    input = Array.from(input);
    let n = initialN;
    let delta = 0;
    let bias = initialBias;
    let b = input.filter((ch) => ch.codePointAt(0) < 128).length;

    // Add ASCII part of the input to the output as is.
    output.push(...input.filter((ch) => ch.codePointAt(0) < 128));
    if (b > 0) output.push(delimiter);

    let h = b; // Handle the non-basic characters
    while (h < input.length) {
        let m = Math.min(...input.filter((ch) => ch.codePointAt(0) >= n).map((ch) => ch.codePointAt(0)));
        delta += (m - n) * (h + 1);
        n = m;

        input.forEach((ch) => {
            const charCode = ch.codePointAt(0);
            if (charCode < n) delta++;
            if (charCode === n) {
                let q = delta;
                for (let k = base; ; k += base) {
                    const t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
                    if (q < t) break;
                    output.push(String.fromCharCode(digitToBasic(t + ((q - t) % (base - t)), 0)));
                    q = Math.floor((q - t) / (base - t));
                }
                output.push(String.fromCharCode(digitToBasic(q, 0)));
                bias = adapt(delta, h + 1, h === b);
                delta = 0;
                h++;
            }
        });
        delta++;
        n++;
    }

    return output.join('');
}

/**
 * Decodes a Punycode string back to Unicode.
 * @param {string} input - The Punycode string to decode.
 * @returns {string} The Unicode representation of the decoded string.
 */
function decode(input) {
    let output = [];
    let n = initialN;
    let i = 0;
    let bias = initialBias;
    let basic = input.lastIndexOf(delimiter);
    if (basic < 0) basic = 0;

    for (let j = 0; j < basic; j++) {
        output.push(input.charCodeAt(j)); // Directly add the ASCII part
    }

    let index = basic > 0 ? basic + 1 : 0;
    while (index < input.length) {
        let oldi = i;
        let w = 1;
        for (let k = base; ; k += base) {
            if (index >= input.length) throw new Error('Bad input: overflow');
            let digit = basicToDigit(input.charCodeAt(index++));
            i += digit * w;
            let t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
            if (digit < t) break;
            w *= base - t;
        }
        bias = adapt(i - oldi, output.length + 1, oldi == 0);
        n += Math.floor(i / (output.length + 1));
        i %= output.length + 1;
        output.splice(i, 0, n);
        i++;
    }

    return String.fromCodePoint(...output);
}

/**
 * Converts a domain name with Unicode characters to a Punycode domain name.
 * @param {string} domain - The domain name to convert.
 * @returns {string} The Punycode version of the domain.
 */
function unicodeToPunycode(domain) {
    return domain
        .split('.')
        .map((part) => (part.match(/[^\x00-\x7F]/) ? 'xn--' + encode(part) : part))
        .join('.');
}

/**
 * Converts a Punycode domain name back to its Unicode representation.
 * @param {string} domain - The Punycode domain name to decode.
 * @returns {string} The Unicode version of the domain.
 */
function punycodeToUnicode(domain) {
    return domain
        .split('.')
        .map((part) => (part.startsWith('xn--') ? decode(part.substring(4)) : part))
        .join('.');
}

module.exports = {
    encode,
    decode,
    unicodeToPunycode,
    punycodeToUnicode,
};
