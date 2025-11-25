project(NitroText)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME NitroText)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Enable Raw Props parsing in react-native (for Nitro Views)
add_compile_options(-DRN_SERIALIZABLE_STATE=1)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
)

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/NitroText+autolinking.cmake)

# Set up local includes
include_directories(
        "src/main/cpp"
        "../cpp"
)

# Add custom ShadowNode implementation
target_sources(
        ${PACKAGE_NAME} PRIVATE
        ../cpp/NitroHtmlUtils.cpp
        ../cpp/NitroHtmlUtils.hpp
        ../cpp/NitroTextShadowNode.cpp
        ../cpp/NitroTextShadowNode.hpp
        ../cpp/NitroTextComponentDescriptor.cpp
        ../cpp/NitroTextComponentDescriptor.hpp
        src/main/cpp/NitroTextRegisterProvider.cpp
        ..
)

find_library(LOG_LIB log)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        android                                   # <-- Android core
)
