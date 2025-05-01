-- Messages table
CREATE TABLE messages (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    message_content VARCHAR2(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin replies table
CREATE TABLE message_replies (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id NUMBER NOT NULL,
    reply_content VARCHAR2(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Reviews table with order reference
CREATE TABLE user_reviews (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    product_name VARCHAR2(255) NOT NULL,
    order_id NUMBER NOT NULL,
    rating NUMBER(1) CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
); 