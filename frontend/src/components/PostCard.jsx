
import PostActions from "./PostActions";
import PostComments from "./PostComments";

function PostCard({ post, onLike, onDislike, onBookmark, onShare, onReport }) {
    return (
        <div className="post-card">
            <div className="post-category">
                {post.category || "General"}
            </div>

            <p className="post-content">{post.content}</p>

            <small>
                {new Date(post.createdAt).toLocaleString()}
            </small>

            <PostActions
                post={post}
                onLike={onLike}
                onDislike={onDislike}
                onBookmark={onBookmark}
                onShare={onShare}
                onReport={onReport}
            />

            <PostComments postId={post.id} />
        </div>
    );
}

export default PostCard;
