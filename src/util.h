#pragma once
#include <string>
#include <fstream>
#include <markdown/html.h>

static std::string load_file(const std::string& path)
{
	std::ifstream ifs(path);
	std::string content( (std::istreambuf_iterator<char>(ifs) ),
		(std::istreambuf_iterator<char>()    ) );

	return content;
}

static void write_file(const std::string& path, const std::string& data)
{
	std::ofstream ofs(path);
	ofs << data;
}

static std::string read_markdown(const std::string& markdown)
{
	hoedown_extensions extensions = hoedown_extensions
		(HOEDOWN_EXT_TABLES 		| 
		 HOEDOWN_EXT_UNDERLINE		|
		 HOEDOWN_EXT_FENCED_CODE	|
		 HOEDOWN_EXT_FOOTNOTES		|
		 HOEDOWN_EXT_MATH);

	hoedown_html_flags html_flags = hoedown_html_flags
		(0);

	hoedown_renderer* render = hoedown_html_renderer_new(html_flags, 0);
	hoedown_document* doc = hoedown_document_new(render, extensions, 16);
   	hoedown_buffer* buf = hoedown_buffer_new(16);
	hoedown_document_render(doc, buf, (uint8_t*)markdown.c_str(), markdown.size());	

	std::string out = std::string((char*)buf->data, buf->size);	

	hoedown_buffer_free(buf);
	hoedown_document_free(doc);
	hoedown_html_renderer_free(render);

	return out;
}
