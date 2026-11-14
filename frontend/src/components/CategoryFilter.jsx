
const categories = [
    { label: "All", value: "all" },
    { label: "Horror", value: "horror" },
    { label: "Advice", value: "advice" },
    { label: "Motivation", value: "motivation" },
    { label: "Funny", value: "funny" }
];

function CategoryFilter({ onCategoryChange }) {
    return (
        <section className="categories">
            {categories.map(category => (
                <button
                    key={category.value}
                    onClick={() => onCategoryChange(category.value)}
                >
                    {category.label}
                </button>
            ))}
        </section>
    );
}

export default CategoryFilter;
