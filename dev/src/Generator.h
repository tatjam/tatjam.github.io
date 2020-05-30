#pragma once
#include <markdown/html.h>
#include <string>
#include <unordered_map>

#include "Post.h"
#include "Theme.h"


// The generator generates all pages
class Generator
{
public:

	// Posts by category
	std::vector<Post> posts;
	std::unordered_map<std::string, std::vector<Post*>> by_category;


	void generate(const std::string& dir, const std::string& out_dir);

	void generate_misc(const std::string& out_file, 
			Theme& theme, Theme& list_theme, const std::string& cur_cat);

	std::string generate_list_item(Post& post, Theme& list_theme);

};
