# Sử dụng nginx:alpine làm máy chủ web tĩnh siêu nhẹ
FROM nginx:alpine

# Sao chép các tệp tĩnh vào thư mục phục vụ web của Nginx
COPY . /usr/share/nginx/html

# Mở cổng 80 cho HTTP
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
