'use strict';

var comment_element_id_prefix = null;
var comment_element_classes = ["comment"];
var injection_element_identifier = ".comment.timeline-comment h3.timeline-comment-header-text";
var clicked_source = "github";

injectButton(injection_element_identifier);

// Response that will be passed back by "executeScript"
var result = "Injection complete!";
result;