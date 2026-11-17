
function PostActions({
    post,
    onLike,
    onDislike,
    onBookmark,
    onShare,
    onReport
}) {
    return (
        <div className="post-actions">
            <button
                className="vote-button like-button"
                onClick={() => onLike(post.id)}
            >
                👍 {post.likes}
            </button>

            <button
                className="vote-button dislike-button"
                onClick={() => onDislike(post.id)}
            >
                👎 {post.dislikes}
            </button>

            <button onClick={() => onBookmark(post.id)}>
                🔖 Bookmark
            </button>

            <button onClick={() => onShare(post.id)}>
                ↗ Share {post.shares || 0}
            </button>

            <button onClick={() => onReport(post.id)}>
                🚩 Report
            </button>
        </div>
    );
}

export default PostActions;
