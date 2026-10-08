"""Pygments lexer for Thinai, aligned with its Langium and TextMate grammars."""

from pygments.lexer import RegexLexer
from pygments.token import Comment, Keyword, Name, Number, Operator, Punctuation, String, Text, Whitespace


class ThinaiLexer(RegexLexer):
    """Highlight Thinai declarations, specifications, and relationships."""

    name = "Thinai"
    aliases = ["thinai", "tni"]
    filenames = ["*.tni"]
    mimetypes = ["text/x-thinai"]

    tokens = {
        "root": [
            (r"\s+", Whitespace),
            (r"//[^\n\r]*", Comment.Single),
            (r"/\*", Comment.Multiline, "block-comment"),
            (r'"', String.Delimiter, "double-string"),
            (r"'", String.Delimiter, "single-string"),
            (r"\b(?:string|number|boolean|date|List|Set|Map)\b", Keyword.Type),
            (r"\b(?:core|supporting|generic)\b", Keyword.Constant),
            (
                r"\b(?:integrationPatterns|postcondition|participants|precondition|separateWays|"
                r"sharedKernel|application|constructor|integration|identifier|repository|transition|"
                r"aggregate|invariant|projector|subdomain|behavior|customer|projects|realizes|supplier|"
                r"bounded|context|depends|exposes|factory|initial|invokes|journey|manages|mirrors|partner|"
                r"returns|service|domain|entity|import|invoke|kernel|method|module|object|serves|shared|"
                r"actor|emits|event|model|query|value|data|enum|from|kind|read|root|when|with|as|by|in|on|to|map)\b",
                Keyword,
            ),
            (r"<->|->|-x-", Operator),
            (r"\b\d+(?:\.\d+)?\b", Number),
            (r"[_a-zA-Z][\w_]*", Name),
            (r"[{}()\[\].,:?]", Punctuation),
            (r".", Text),
        ],
        "block-comment": [
            (r"\*/", Comment.Multiline, "#pop"),
            (r"[^*]+", Comment.Multiline),
            (r"\*", Comment.Multiline),
        ],
        "double-string": [
            (r"\\.", String.Escape),
            (r"\[\[", Punctuation, "linked-reference"),
            (r'"', String.Delimiter, "#pop"),
            (r'[^\\\[\"]+', String),
            (r"\[(?!\[)", String),
            (r"\[", String),
        ],
        "single-string": [
            (r"\\.", String.Escape),
            (r"\[\[", Punctuation, "linked-reference"),
            (r"'", String.Delimiter, "#pop"),
            (r"[^\\\[']+", String),
            (r"\[(?!\[)", String),
            (r"\[", String),
        ],
        "linked-reference": [
            (r"\]\]", Punctuation, "#pop"),
            (r"[_a-zA-Z][\w_]*(?:\.[_a-zA-Z][\w_]*)*", Name.Attribute),
            (r"\s+", Whitespace),
            (r".", Name.Attribute),
        ],
    }
