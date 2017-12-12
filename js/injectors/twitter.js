'use strict';

var comment_element_id_prefix = null;
var comment_element_classes = ["permalink-tweet", "tweet"];
var injection_element_identifier = ".permalink-header";
var clicked_source = "twitter";

injectButton(injection_element_identifier);

// Response that will be passed back by "executeScript"
var result = "Injection complete!";
result;
