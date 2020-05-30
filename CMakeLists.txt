cmake_minimum_required (VERSION 3.2.3)

# Define basic compiler and CMake configuration

set (CMAKE_CXX_STANDARD 17)
set (CMAKE_EXPORT_COMPILE_COMMANDS ON)


##################################################################################
# OSPGL - The game engine
##################################################################################
project(sweb)


file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE MDOWN_SOURCES "dep/markdown/*.c")

# Create the OSPGL executable

add_executable(sweb ${SOURCES} ${MDOWN_SOURCES})



# Name it ospgl (lowercase)
set_target_properties(sweb PROPERTIES OUTPUT_NAME "sweb")

# Set compiler options for OSPGL

if(MSVC)
	add_definitions(-D_CRT_SECURE_NO_WARNINGS)
	add_definitions(-D_SILENCE_ALL_CXX17_DEPRECATION_WARNINGS)
	target_compile_options(sweb PUBLIC /bigobj)
else()
	target_compile_options(sweb PUBLIC -g -Werror)
	link_libraries(${CMAKE_DL_LIBS})
endif()

include_directories(dep)

target_link_libraries(sweb ${CMAKE_DL_LIBS})
