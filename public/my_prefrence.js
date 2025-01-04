// Static example data for testing the layout
const gridsData = [
    [
        { image: 'https://via.placeholder.com/150', label: 'Academic' },
        { image: 'https://via.placeholder.com/150', label: 'Research' },
        { image: 'https://via.placeholder.com/150', label: 'Sports' },
        { image: 'https://via.placeholder.com/150', label: 'Art' },
    ],
    [
        { image: 'https://via.placeholder.com/150', label: 'Music' },
        { image: 'https://via.placeholder.com/150', label: 'Nature' },
        { image: 'https://via.placeholder.com/150', label: 'Technology' },
        { image: 'https://via.placeholder.com/150', label: 'History' },
    ],
    // You can add more grids as needed
];

// Function to generate the grid dynamically
function generateGrids() {
    const container = document.querySelector('.preference-grids-container');
    gridsData.forEach(grid => {
        const gridElement = document.createElement('div');
        gridElement.classList.add('preference-grid');

        grid.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('preference-item');
            
            // Create circle and image inside the item
            const circle = document.createElement('div');
            circle.classList.add('circle');
            itemElement.appendChild(circle);
            
            const img = document.createElement('img');
            img.src = item.image; // Static placeholder image
            itemElement.appendChild(img);
            
            gridElement.appendChild(itemElement);
        });

        container.appendChild(gridElement);
    });

    // Event listener setup for toggling circle
    document.querySelectorAll('.preference-item').forEach(item => {
        item.addEventListener('click', function() {
            const circle = this.querySelector('.circle');
            circle.classList.toggle('checked'); // Toggle the checked class
        });
    });

    document.querySelectorAll('.circle').forEach(circle => {
        circle.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent triggering the parent item click
            this.classList.toggle('checked'); // Toggle the checked class
        });
    });
}

// Call the function to generate grids on page load
window.onload = generateGrids;

