# Memory Game

Welcome to the Memory Game! This is a fun and interactive game built using Python and Flask, where players test their memory by recalling details about images displayed on the screen.

## Project Structure

The project is organized as follows:

```
memory-game
├── src
│   ├── app.py          # Main entry point of the application
│   ├── game.py         # Contains the game logic
│   ├── static
│   │   ├── css
│   │   │   └── style.css  # Styles for the game
│   │   ├── js
│   │   │   └── game.js     # JavaScript for handling user interactions
│   │   └── images          # Directory for game images
│   └── templates
│       ├── index.html      # Landing page template
│       └── game.html       # Game interface template
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/memory-game.git
   cd memory-game
   ```

2. **Install the required dependencies:**
   ```
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```
   python src/app.py
   ```

4. **Open your browser and go to:**
   ```
   http://127.0.0.1:5000
   ```

## Gameplay

- The game will display an image and ask you to recall details about it.
- You will be prompted to describe either the current image or the previous image.
- The game continues until you answer incorrectly, at which point your score will be displayed.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the game!

## License

This project is licensed under the MIT License.