---
title: Tags and persistent tag's pages
---
Adding tags in latid is as simple as adding meta field named "tags",
and filling it with comma-separated list of tags in almost
any language (if it's supported by Unidecode library). Any symbol allowed, exept comma. 
Pages for tags will be generated automatically, files will be
named by transliterated tag text.

Look at example site templates to see, how you can add tags list
to your design.

### Page tags list

      {% if view.tags_list and view.tags_list.length>0 %}
      {% for tag in view.tags_list %}
      <a href="{{tag.uri}}"><span class="badge badge-primary">{{tag.file.meta.title}}</span></a>
      {% endfor %}
      {% endif %}

### List of all site tags with number of tagged pages for each
   
      {% for tag in meta.tags %} 
      <a href="{{tag.uri}}">{{tag.name}}</a>
      <span class="pages_num">({{tag.count}})</span>
      </li>
      {%endfor%}

Persistent tags pages
---------------------
You may have persistent page for any tag. "Persistence" means,
that tag page will be saved between sessions and you can add
any static content to it. 

For example, you can add comments for some important tags. It adds 
some human touch to content. You can even add tag to your tag page. 
If you do, tell me your reasons, please.


To make page for tag persistent, do the following:

1. Navigate to that tag page in GUI
1. Click "view/edit" button
1. That's it

### List of tags, with persistent tags highlighted

        <ul>
            {% for tag in meta.tags %} 
            <!-- check, if tag page has virtual property -->
            <!-- if not, this is a persistent page -->
            {% set is_fav = not list.getByField("uri", tag.uri).virtual  %}                   
                <li>{% if is_fav %}<strong> {% endif %}
                <a href="{{tag.uri}}">{{tag.name}}</a>
                {% if isfav %}</strong> (important one) {% endif %}
                <span>&mdash;{{tag.count}}</span>
                </li>
            {% endfor %}
        </ul>
