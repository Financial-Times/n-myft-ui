#!/bin/bash

chmod +x $0

# Define the demo-build function
demo-build() {
    # Remove existing directory
    rm -rf node_modules/@financial-times/n-myft-ui
    # Create necessary directories
    mkdir -p node_modules/@financial-times/n-myft-ui/myft
    # Copy components to the corresponding directory
    cp -r components node_modules/@financial-times/n-myft-ui/components/
    # Compile SCSS file to CSS
    sass demos/src/demo.scss public/main.css --load-path node_modules
    # Indicate that build is complete
    echo "Demo build completed."
}

# Define the demo function
demo() {
    # Build the demo
    demo-build
    # Run the Node.js application
    node demos/app
}

# Define the static-demo function
static-demo() {
    # Build the demo
    demo-build
    # Execute the shell script to generate the static demo
    scripts/make-static-demo.sh
}

# Check the first argument passed to the script
case "$1" in
    demo-build)
        demo-build
        ;;
    demo)
        demo
        ;;
    static-demo)
        static-demo
        ;;
    *)
        # If the argument does not match any of the above options, display an error message
        echo "Usage: $0 {demo-build|demo|static-demo}"
        exit 1
        ;;
esac

exit 0
