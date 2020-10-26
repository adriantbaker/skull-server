type TrieNode = {
    children: { [key: string]: TrieNode},
    isEnd: boolean
}

const newTrieNode = (): TrieNode => ({
    children: {},
    isEnd: false,
});

class Trie {
    root: TrieNode

    constructor() {
        this.root = newTrieNode();
    }

    insert(word: string) {
        let node = this.root;
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            if (!node.children[char]) {
                node.children[char] = newTrieNode();
            }
            node = node.children[char];
        }
        node.isEnd = true;
    }

    contains(word: string) {
        let node = this.root;
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node.isEnd;
    }
}

export default Trie;
