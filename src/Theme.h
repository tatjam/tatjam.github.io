#pragma once
#include <string>
#include <vector>

class Theme
{
public:

	struct Replacement
	{
		size_t index;
		std::string value;
	};

	std::string html;
	
	// All the different tags
	std::vector<Replacement> replaces;

	Theme(const std::string& file);
};
