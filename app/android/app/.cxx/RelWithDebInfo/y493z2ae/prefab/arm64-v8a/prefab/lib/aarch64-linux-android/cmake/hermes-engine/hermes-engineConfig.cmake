if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/ritik/.gradle/caches/8.14.3/transforms/cf3f8f49da08c5cdc35c75ae7edfd46e/transformed/hermes-android-0.81.0-release/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/ritik/.gradle/caches/8.14.3/transforms/cf3f8f49da08c5cdc35c75ae7edfd46e/transformed/hermes-android-0.81.0-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

