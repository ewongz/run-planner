# Step 1: Use the Node.js base image for building the app
FROM node:16 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the React app source code
COPY . .

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Use a lightweight Nginx server to serve the built app
FROM nginx:stable-alpine

# Step 8: Copy the build files to Nginx's default public directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose the port Nginx will use
EXPOSE 80

# Step 10: Start Nginx server
CMD ["nginx", "-g", "daemon off;"]