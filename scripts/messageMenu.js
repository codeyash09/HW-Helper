// Function to create and show the popup menu
function createMessageMenu(messageElement, isOwnMessage) {
    // Create popup menu
    const popup = document.createElement('div');
    popup.className = 'message-popup';
    
    // Get message timestamp
    const timestamp = messageElement.querySelector('.timestamp').textContent;
    
    // Create date section
    const dateSection = document.createElement('div');
    dateSection.className = 'message-popup-date';
    dateSection.textContent = timestamp;
    popup.appendChild(dateSection);
    
    // Create emoji reactions section
    const emojiSection = document.createElement('div');
    emojiSection.className = 'message-popup-emoji';
    
    const emojis = [
        { emoji: '❤️', label: 'Heart' },
        { emoji: '😂', label: 'Laugh' },
        { emoji: '😠', label: 'Mad' },
        { emoji: '👍', label: 'Thumbs Up' }
    ];
    
    emojis.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'emoji-reaction';
        emojiButton.innerHTML = emoji.emoji;
        emojiButton.title = emoji.label;
        emojiButton.addEventListener('click', () => {
            handleEmojiReaction(emoji.emoji, messageElement);
            popup.classList.remove('show');
        });
        emojiSection.appendChild(emojiButton);
    });

    // Add custom emoji button
    const customEmojiButton = document.createElement('button');
    customEmojiButton.className = 'emoji-reaction custom-emoji';
    customEmojiButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    customEmojiButton.title = 'Add Custom Emoji';
    customEmojiButton.addEventListener('click', () => {
        // Get the emoji picker element
        const emojiPicker = document.querySelector('em-emoji-picker');
        if (emojiPicker) {
            // Position the emoji picker near the plus button
            const rect = customEmojiButton.getBoundingClientRect();
            emojiPicker.style.position = 'fixed';
            emojiPicker.style.left = `${rect.left - 320}px`; // Move 320px to the left
            emojiPicker.style.top = `${rect.bottom + 10}px`;
            emojiPicker.style.zIndex = '1000';
            emojiPicker.style.display = 'block';

            // Add click handler for emoji selection
            const handleEmojiSelect = (e) => {
                if (e.detail && e.detail.emoji) {
                    handleEmojiReaction(e.detail.emoji, messageElement);
                    emojiPicker.style.display = 'none';
                    popup.classList.remove('show');
                    emojiPicker.removeEventListener('emoji-click', handleEmojiSelect);
                }
            };

            emojiPicker.addEventListener('emoji-click', handleEmojiSelect);
        }
    });
    emojiSection.appendChild(customEmojiButton);
    
    popup.appendChild(emojiSection);
    
    // Create action buttons section
    const actionsSection = document.createElement('div');
    actionsSection.className = 'message-popup-actions';
    
    // Reply button
    const replyButton = document.createElement('button');
    replyButton.className = 'message-popup-action';
    replyButton.innerHTML = '<i class="fa-solid fa-reply"></i> Reply';
    replyButton.addEventListener('click', () => {
        handleReply(messageElement);
        popup.classList.remove('show');
    });
    actionsSection.appendChild(replyButton);
    
    // Copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'message-popup-action';
    copyButton.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
    copyButton.addEventListener('click', () => {
        handleCopy(messageElement);
        popup.classList.remove('show');
    });
    actionsSection.appendChild(copyButton);

    // Add different buttons based on message ownership
    if (isOwnMessage) {
        // Edit button for own messages
        const editButton = document.createElement('button');
        editButton.className = 'message-popup-action';
        editButton.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
        editButton.addEventListener('click', () => {
            handleEdit(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(editButton);

        // Delete (unsend) button for own messages
        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-popup-action delete-action';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Unsend';
        deleteButton.addEventListener('click', () => {
            handleUnsend(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(deleteButton);
    } else {
        // Delete button for received messages
        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-popup-action delete-action';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Delete for me';
        deleteButton.addEventListener('click', () => {
            handleDelete(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(deleteButton);
    }
    
    popup.appendChild(actionsSection);
    
    // Position the popup
    const dots = messageElement.querySelector('.message-dots');
    const rect = dots.getBoundingClientRect();
    
    // Check if message is near the bottom of the chat
    const chatMessages = document.getElementById('chat-messages');
    const chatRect = chatMessages.getBoundingClientRect();
    const isRecentMessage = rect.bottom > chatRect.bottom - 200; // If message is within 200px of bottom
    const isVeryRecentMessage = rect.bottom > chatRect.bottom - 100; // If message is within 100px of bottom
    const isSecondMostRecent = rect.bottom > chatRect.bottom - 150 && rect.bottom <= chatRect.bottom - 100; // If message is between 100-150px from bottom
    
    // Position based on message type
    if (isOwnMessage) {
        // For own messages, position to the left of the dots
        popup.style.left = `${rect.left - 245}px`; // Move 245px to the left
        popup.style.top = isVeryRecentMessage ? `${rect.top - 240}px` : 
                         isSecondMostRecent ? `${rect.top - 200}px` :
                         isRecentMessage ? `${rect.top - 120}px` : 
                         `${rect.top - 80}px`; // Move higher for very recent messages
    } else {
        // For received messages, position very close to the dots
        popup.style.left = `${rect.right - 35}px`; // Move 35px to the left
        popup.style.top = isVeryRecentMessage ? `${rect.top - 200}px` : 
                         isRecentMessage ? `${rect.top - 120}px` : 
                         `${rect.top - 80}px`; // Move higher for very recent messages
    }
    
    // Add to document
    document.body.appendChild(popup);
    
    // Show popup
    popup.classList.add('show');

    // Store the initial position relative to the viewport
    const initialTop = rect.top;
    const initialLeft = rect.left;
    
    // Update popup position on scroll
    const updatePopupPosition = () => {
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        if (isOwnMessage) {
            popup.style.left = `${initialLeft - 245}px`;
            popup.style.top = isVeryRecentMessage ? `${initialTop - 240 + scrollY}px` : 
                             isSecondMostRecent ? `${initialTop - 200 + scrollY}px` :
                             isRecentMessage ? `${initialTop - 120 + scrollY}px` : 
                             `${initialTop - 80 + scrollY}px`;
        } else {
            popup.style.left = `${initialLeft - 35}px`;
            popup.style.top = isVeryRecentMessage ? `${initialTop - 200 + scrollY}px` : 
                             isRecentMessage ? `${initialTop - 120 + scrollY}px` : 
                             `${initialTop - 80 + scrollY}px`;
        }
    };

    // Add scroll event listener
    window.addEventListener('scroll', updatePopupPosition);
    
    // Close popup when clicking outside or moving cursor away
    const closePopup = (e) => {
        // Check if the cursor is over the popup, message, or emoji picker
        const isOverPopup = popup.contains(e.target);
        const isOverMessage = messageElement.contains(e.target);
        const isOverEmojiPicker = e.target.closest('em-emoji-picker');
        const isOverDots = e.target === dots;
        
        // If cursor is not over any of these elements, close the popup
        if (!isOverPopup && !isOverMessage && !isOverEmojiPicker && !isOverDots) {
            // Add falling animation to emojis
            const emojis = popup.querySelectorAll('.emoji-reaction');
            emojis.forEach((emoji, index) => {
                setTimeout(() => {
                    emoji.classList.add('falling');
                }, index * 100); // Stagger the falling animation
            });

            // Add closing animation to popup
            popup.classList.add('closing');
            
            // Remove popup after animations complete
            setTimeout(() => {
                popup.remove();
            }, 800); // Wait for all animations to complete
            
            document.removeEventListener('mousemove', closePopup);
        }
    };
    
    // Use mousemove instead of click for smoother cursor tracking
    document.addEventListener('mousemove', closePopup);
}

// Handle emoji reactions
function handleEmojiReaction(emoji, messageElement) {
    // Get or create reactions container
    let reactionsContainer = messageElement.querySelector('.message-reactions');
    if (!reactionsContainer) {
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        messageElement.appendChild(reactionsContainer); // Changed from .content to messageElement
    }

    // Check if this emoji reaction already exists
    const existingReaction = reactionsContainer.querySelector(`[data-emoji="${emoji}"]`);
    if (existingReaction) {
        // Toggle the reaction
        if (existingReaction.classList.contains('active')) {
            // Remove reaction
            existingReaction.remove();
            if (reactionsContainer.children.length === 0) {
                reactionsContainer.remove();
            }
        } else {
            // Add reaction
            existingReaction.classList.add('active');
        }
    } else {
        // Create new reaction
        const reactionElement = document.createElement('div');
        reactionElement.className = 'message-reaction active';
        reactionElement.setAttribute('data-emoji', emoji);
        reactionElement.textContent = emoji;
        
        // Add click handler to toggle reaction
        reactionElement.addEventListener('click', () => {
            handleEmojiReaction(emoji, messageElement);
        });
        
        reactionsContainer.appendChild(reactionElement);
    }

    // TODO: Update reaction in database
    console.log('Reacted with:', emoji, 'to message:', messageElement.querySelector('.text').textContent);
}

// Handle reply
function handleReply(messageElement) {
    const messageText = messageElement.querySelector('.text').textContent;
    const chatInput = document.getElementById('chatInput');
    chatInput.value = `> ${messageText}\n`;
    chatInput.focus();
}

// Handle copy
function handleCopy(messageElement) {
    const messageText = messageElement.querySelector('.text').textContent;
    navigator.clipboard.writeText(messageText).then(() => {
        // Show a temporary "Copied!" tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = 'Copied!';
        document.body.appendChild(tooltip);
        
        // Position tooltip near the message
        const rect = messageElement.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 30}px`;
        
        // Remove tooltip after 2 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    });
}

// Handle edit
function handleEdit(messageElement) {
    const messageText = messageElement.querySelector('.text');
    const originalText = messageText.textContent;
    
    // Create edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = originalText;
    editInput.className = 'message-edit-input';
    
    // Replace text with input
    messageText.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // Handle edit completion
    const finishEdit = () => {
        const newText = editInput.value.trim();
        if (newText && newText !== originalText) {
            messageText.textContent = newText;
            // TODO: Update message in database
            console.log('Message edited:', newText);
        } else {
            messageText.textContent = originalText;
        }
        editInput.replaceWith(messageText);
    };

    // Handle edit submission
    editInput.addEventListener('blur', finishEdit);
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEdit();
        } else if (e.key === 'Escape') {
            editInput.value = originalText;
            finishEdit();
        }
    });
}

// Handle unsend (delete for everyone)
function handleUnsend(messageElement) {
    if (confirm('Are you sure you want to unsend this message? This action cannot be undone.')) {
        // TODO: Update message in database to show as unsent
        messageElement.style.opacity = '0.5';
        const text = messageElement.querySelector('.text');
        text.textContent = 'This message was unsent';
        text.style.fontStyle = 'italic';
        console.log('Message unsent');
    }
}

// Handle delete (delete for me)
function handleDelete(messageElement) {
    if (confirm('Are you sure you want to delete this message? This will only remove it from your view.')) {
        // TODO: Update message in database to show as deleted for this user
        messageElement.style.display = 'none';
        console.log('Message deleted for user');
    }
}

// Add click handlers to all message dots
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    
    // Use event delegation for dynamically added messages
    chatMessages.addEventListener('click', (e) => {
        const dots = e.target.closest('.message-dots');
        if (dots) {
            const message = dots.closest('.message');
            const isOwnMessage = message.classList.contains('own-message');
            createMessageMenu(message, isOwnMessage);
        }
    });
}); 