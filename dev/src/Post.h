#pragma once
#include <string>
#include "Theme.h"

class Post
{
public:

	std::string url;
	std::string category;
	std::string contents;

	std::string title;
	std::string date;
	std::string summary;

	int year; 
	int month;
	int day;
	int sort_num;

	std::string file;
	std::string markdown;
	std::string path;

	std::string extra_head;

	Post* next;
	Post* prev;

	void generate(Theme& theme);

	void apply(Theme& theme, std::string& html);

	Post(
		const std::string& file, 
		const std::string& category, 
		const std::string& path, 
		const std::string& url);
};
