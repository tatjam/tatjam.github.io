#include "Generator.h"
#include <filesystem>
#include <iostream>
#include <vector>
#include <algorithm>

#include "util.h"

namespace fs = std::filesystem;

std::string Generator::generate_list_item(Post& post, Theme& list_theme)
{
	std::string html = list_theme.html;

	post.apply(list_theme, html);

	return html;
}

void Generator::generate_misc(const std::string& out_file, 
		Theme& theme, Theme& list_theme, const std::string& cur_cat)
{
	// We load the HTMl
	std::string html = theme.html;
	size_t off = 0;

	for(const Theme::Replacement& repl : theme.replaces)
	{
		std::string insert = "";
		if(repl.value == "POST_LIST")
		{
			for(int i = posts.size() - 1; i >= 0; i--)
			{
				Post& p = posts[i];
				insert += generate_list_item(p, list_theme);	
				insert += '\n';
			}
		}
		else if(repl.value == "POST_LIST_CAT")
		{
			for(int i = by_category[cur_cat].size() - 1; i >= 0; i--)
			{
				Post* p = by_category[cur_cat][i];
				insert += generate_list_item(*p, list_theme);
				insert += '\n';
			}
		}
		else if(repl.value == "CUR_CAT_NAME")
		{
			insert = cur_cat;
		}

		if(insert != "")
		{
			html.insert(repl.index + off, insert);
			off += insert.size();
		}
	}

	// Write contents
	write_file(out_file, html);

	std::cout << "Generated " << out_file << "!" << std::endl;
}

void Generator::generate(const std::string& dir, const std::string& out_dir)
{
	// All folders under res/, except for theme/ and ignore/ are
	// categories
	Theme post_theme = Theme(load_file(dir + "/theme/post.html"));

	std::vector<std::string> categories;

	for(const auto& entry : fs::directory_iterator(dir + "/"))
	{
		if(entry.is_directory())
		{
			std::string name = entry.path().filename().string();

			if(!(name == "theme" || name == "ignore"))
			{
				categories.push_back(name);	
			}
		}
	}

	// Process all posts
	for(const std::string& cat : categories)
	{
		for(const auto& entry : fs::directory_iterator(dir + "/" + cat + "/"))
		{
			if(entry.is_regular_file())
			{
				std::string file = dir + "/" + cat + "/" 
					+ entry.path().filename().string();

				std::string filename = entry.path().filename().string();
				filename = filename.substr(0, filename.find_last_of('.'));
				std::string url = cat + "/" + filename + ".html";
				
				std::string final_path = out_dir + "/" + url; 
				fs::create_directories(out_dir + "/" + cat);

				Post post = Post(file, cat, final_path, url);	

				
				posts.push_back(post);
			}

		}
	}

	
	// Generate
	// Sort by date
	std::sort(posts.begin(), posts.end(), [](const Post& a, const Post& b)
	{
		return a.sort_num < b.sort_num;
	});

	// Make by_category
	for(Post& p : posts)
	{
		auto it = by_category.find(p.category);
		if(it == by_category.end())
		{
			by_category[p.category] = std::vector<Post*>();
		}

		by_category[p.category].push_back(&p);
	}


	for(auto& pair : by_category)
	{
		std::vector<Post*> post_v = pair.second;
		for(size_t i = 0; i < post_v.size(); i++)
		{
			if(i != 0)
			{
				post_v[i]->prev = post_v[i - 1];
			}
			if(i <= post_v.size() - 2)
			{
				post_v[i]->next = post_v[i + 1];
			}
			
			post_v[i]->generate(post_theme);
		}
	}

	Theme index_theme = Theme(load_file("res/theme/index.html"));
	Theme list_theme = Theme(load_file("res/theme/list.html"));
	Theme cat_theme = Theme(load_file("res/theme/category.html"));

	// Now generate category pages and the index page, and we are done
	generate_misc(out_dir + "/index.html", index_theme, list_theme, "");

	for(auto& pair : by_category)
	{
		generate_misc(out_dir + "/category-" + pair.first + ".html", cat_theme, list_theme, pair.first);
	}

}
