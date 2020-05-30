#include "Theme.h"
#include <iostream>
#include <algorithm>


Theme::Theme(const std::string& file)
{
	html = file;

	// Search all <$[text]> tags
	for(size_t i = 0; i < html.size();)
	{
		if(html[i] == '<' && html[i + 1] == '$')
		{
			size_t j = 0;
			std::string buff = "";
			while(true)
			{
				char c = html[i + j + 2];
				if(c == '>')
				{
					break;	
				}
				else
				{
					buff += c;
					j++;
				}
			}

			Replacement repl;
			repl.index = i;
			repl.value = buff;

			replaces.push_back(repl);	
			
			// Remove the marker from the html
			html = html.erase(i, buff.size() + 3);
		}
		else
		{
			i++;
		}
	}

	// Sort by index
	std::sort(replaces.begin(), replaces.end(), [](const Replacement& a, const Replacement& b)
		{
			return a.index < b.index;
		});
}
