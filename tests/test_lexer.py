import unittest

from pygments import lex
from pygments.lexers import get_lexer_by_name
from pygments.token import Comment, Keyword, Name, Operator, Punctuation, String


class ThinaiLexerTests(unittest.TestCase):
    def setUp(self):
        self.lexer = get_lexer_by_name("thinai")

    def test_registered_alias_and_language_constructs(self):
        tokens = list(lex("aggregate Order { root entity Order {} }", self.lexer))

        self.assertIn((Keyword, "aggregate"), tokens)
        self.assertIn((Keyword, "root"), tokens)
        self.assertIn((Keyword, "entity"), tokens)
        self.assertIn((Name, "Order"), tokens)
        self.assertIn((Punctuation, "{"), tokens)

    def test_types_comments_relationships_and_specification_references(self):
        source = '''
bounded context Ordering {
    subdomain Orders kind core
    value object OrderId { raw: string }
    // line comment
    /* block comment */
    journey PlaceOrder {
        invoke Ordering.App.place when "status is [[Order.status]]"
    }
    customer Shipping -> supplier Ordering
    partner Ordering <-> Shipping
    separateWays Ordering -x- Legacy
}
'''
        tokens = list(lex(source, self.lexer))

        self.assertIn((Keyword.Type, "string"), tokens)
        self.assertIn((Keyword.Constant, "core"), tokens)
        self.assertIn((Comment.Single, "// line comment"), tokens)
        self.assertIn((Comment.Multiline, "/*"), tokens)
        self.assertIn((Operator, "->"), tokens)
        self.assertIn((Operator, "<->"), tokens)
        self.assertIn((Operator, "-x-"), tokens)
        self.assertIn((Punctuation, "[["), tokens)
        self.assertIn((Name.Attribute, "Order.status"), tokens)
        self.assertIn((Punctuation, "]]"), tokens)
        self.assertIn((String.Delimiter, '"'), tokens)

    def test_escaped_quotes_stay_inside_strings(self):
        tokens = list(lex(r'behavior "say \"hello\""', self.lexer))

        self.assertIn((String.Escape, r'\"'), tokens)
        self.assertIn((String, "hello"), tokens)


if __name__ == "__main__":
    unittest.main()
