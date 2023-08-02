# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the container's working directory
COPY . .

# Build the Next.js app for production
RUN npm run build

# Set the environment variable to indicate production mode
ENV NODE_ENV=production

# Expose the port on which the Next.js app runs
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
