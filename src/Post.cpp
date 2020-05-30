#include "Post.h"
#include "util.h"
#include <iostream>

void Post::apply(Theme& theme, std::string& html)
{
	size_t off = 0;

	for(const Theme::Replacement& repl : theme.replaces)
	{
		std::string insert = "";
		if(repl.value == "POST_CONTENTS")
		{
			insert = contents;
		}
		else if(repl.value == "POST_TITLE")
		{
			insert = title;
		}
		else if(repl.value == "POST_DATE")
		{	
			insert = date;
		}
		else if(repl.value == "POST_SUMMARY")
		{
			insert = summary;
		}
		else if(repl.value == "CATEGORY_NAME")
		{
			insert = category;
		}
		else if(repl.value == "POST_URL")
		{
			insert = url;
		}
		else if(repl.value == "CATEGORY_LINK")
		{
			insert = "/category-" + category + ".html";
		}
		else if(repl.value == "NEXT_POST_TITLE")
		{
			if(next == nullptr)
			{
				insert = "(None)";
			}
			else
			{
				insert = next->title;
			}
		}
		else if(repl.value == "PREV_POST_TITLE")
		{
			if(prev == nullptr)
			{
				insert = "(None)";
			}
			else
			{
				insert = prev->title;
			}
		}
		else if(repl.value == "NEXT_POST")
		{
			if(next != nullptr)
			{
				insert = "/" + next->url;
			}
		}
		else if(repl.value == "PREV_POST")
		{
			if(prev != nullptr)
			{
				insert = "/" + prev->url;
			}
		}

		if(insert != "")
		{
			html.insert(repl.index + off, insert);
			off += insert.size();
		}
	}
}

void Post::generate(Theme& theme)
{
	contents = read_markdown(markdown);

	// Process the post 
	std::string html = theme.html;

	apply(theme, html);

	// Write contents
	write_file(path, html);

	std::cout << "Generated " << path << "!" << std::endl;

}

Post::Post(
		const std::string& file, 
		const std::string& category, 
		const std::string& path, 
		const std::string& url)
{
	this->category = category;
	this->url = url;
	this->file = file;
	this->path = path;

	markdown = load_file(file);
	
	// First three lines are metadata
	this->title = markdown.substr(0, markdown.find_first_of('\n'));
	markdown = markdown.substr(markdown.find_first_of('\n') + 1);
	this->date = markdown.substr(0, markdown.find_first_of('\n'));
	markdown = markdown.substr(markdown.find_first_of('\n') + 1);
	this->summary =markdown.substr(0, markdown.find_first_of('\n'));
	markdown = markdown.substr(markdown.find_first_of('\n') + 1);

	// Parse the date
	std::sscanf(this->date.c_str(), "%i-%i-%i", &year, &month, &day);
	sort_num = year * 365 + month * 31 + day;

	next = nullptr;
	prev = nullptr;

}

