#include "Generator.h"
#include <iostream>

int main(void)
{
	std::cout << "Generating website" << std::endl;

	Generator generator = Generator();
	generator.generate("res", "..");

	std::cout << "Generation done!" << std::endl;
}
