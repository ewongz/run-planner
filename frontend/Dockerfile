# Use the Node.js base image for building the app
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install 'serve' globally to serve the build
RUN npm install -g serve

ADD . /app

# Step 6: Build the React app for production
RUN npm run build

# Expose port 3000 for the React app
EXPOSE 3000

# Serve the app using a simple Node.js HTTP server
CMD ["npx", "serve", "-s", "build"]