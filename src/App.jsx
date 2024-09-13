import { createContext, useContext, useEffect, useState } from 'react'
import './App.css'

const RouterContext = createContext(null);
const PostContext = createContext(null);

const routes = [
  {
    id: crypto.randomUUID(),
    name: 'Home',
    url: '#/',
    element: <Home />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Popular',
    url: '#/popular',
    element: <Popular />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Posts',
    url: '#/posts',
    element: <Posts />,
  },
];

const notFound = {
  name: 'Page not found',
  element: <NotFound />,
  // url: '',
}

function getRoute(routeUrl) {
  const route = routes.find(x => x.url === routeUrl);
  return route ?? notFound; //?? null veya undefined dönüyosa notfoundu getirio
}

const title = "App";

function setTitle(pageTitle) {
  document.title = `${pageTitle} - ${title}`;
}

function App() {
  const [route, setRoute] = useState(
    () => {
      if (location.hash.length < 2) {
        return routes[0];
      }
      return getRoute(location.hash);
    }
  );

  useEffect(() => {
    setTitle(route.name);
  }, [route]);

  useEffect(() => {
    window.addEventListener('hashchange', function () {
      setRoute(getRoute(location.hash));
    });
  }, []);

  return (
    <RouterContext.Provider value={route}>
      <div className='container'>
        <Header />
        <Main />
      </div>
    </RouterContext.Provider>
  )
}

function Header() {
  return (
    <div className='header'>
      <a href="/#" className='logo'> <img src="/img/blogger.svg" alt="" /> </a>
      <Nav />
      <div className="recordBtns">
        <button className='loginBtn'>Login</button>
        <button className='SignUpBtn'>Sign Up</button>
      </div>
    </div>
  )
}

function Nav() {
  const route = useContext(RouterContext);

  return (
    <ul className="nav">
      {routes.map(x =>
        <li key={x.id}>
          <a href={x.url} className={route.url === x.url ? 'selected' : ''}>{x.name}</a>
        </li>)}
    </ul>
  )
}

function Main() {
  const [postId, setPostId] = useState(null);

  return (
    <div className='main'>
      <PostContext.Provider value={{ postId, setPostId }}>
        <Content />
        <Sidebar />
      </PostContext.Provider>
    </div>
  )
}

function Home() {
  const route = useContext(RouterContext);
  const mainClass = route.url === '#/' ? 'homeMain' : 'main';

  return (
    <div className={mainClass}>
      <div className="homePageInfo">
        <h1>Inspiration is everywhere</h1>
        <p>There is no passion to be found playing small in settling for a life that is less than the one you are capable of living</p>
        <button className='getStarted'>Get Started</button>
      </div>
      <img src="/img/writer.png" alt="" />
    </div>
  );
}

function Popular() {
  const [topList, setTopList] = useState([]);
  const { postId } = useContext(PostContext);
  const route = useContext(RouterContext);

  useEffect(() => {
    fetch('https://dummyjson.com/posts')
      .then(r => r.json())
      .then(data => {
        const sortedPosts = [...data.posts].sort((a, b) => b.reactions.likes - a.reactions.likes);
        const topThreePosts = sortedPosts.slice(0, 6);
        setTopList(topThreePosts);
      });
  }, []);
  return (
    <div className='topList'>
      {topList.map((x, i) => (
        <div className='topListItem' key={i}>
          <h3 style={{ fontStyle: 'italic', fontSize: '26px' }}>{x.title}</h3>
          <p style={{ fontSize: '16px', lineHeight: '23px'}}>{x.body}</p>
          <strong style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}> <img src="/img/like.svg" alt="" /> {x.reactions.likes}</strong>
        </div>
      ))}
    </div>
  )
}

function Content() {
  const route = useContext(RouterContext);
  const [postDetail, setPostDetail] = useState([]);
  const { postId, setPostId } = useContext(PostContext);

  useEffect(() => {
    if (postId) {
      fetch(`https://dummyjson.com/posts/${postId}`)
        .then(r => r.json())
        .then(data => setPostDetail(data));
    }
  }, [postId]);

  function handleClick(e) {
    e.preventDefault();
    setPostId(null);
  }

  const contentClass = route.url === '#/' ? 'homeContent' : 'content';

  return (
    <div className={contentClass}>
      {postId && route.url === '#/posts' ? (
        <>
          <a href="#" onClick={handleClick}>
            <img style={{ width: '26px', marginBottom: '20px' }} src="/img/back.svg" alt="" /> 
          </a>
          <div className='postsDetail'>
            <h2>{postDetail.title}</h2>
            <p>{postDetail.body}</p>
          </div>
          
        </>
      ) : (
        route.element
      )}
    </div>
  )
}


function Sidebar() {
  const { postId } = useContext(PostContext);
  const route = useContext(RouterContext);

  const sidebarAddClass = postId && route.url === '#/posts' ? 'sidebarPost' : 'sidebar';

  return (
    <div className={sidebarAddClass}>
      <div className="widget">
        {postId && route.url === '#/posts' ? (
          <Comments />
        ) : null
        }
      </div>
    </div>
  )
}

function Posts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(localStorage.page ? parseInt(localStorage.page) : 1);
  const [limit, setLimit] = useState(localStorage.limit ? parseInt(localStorage.limit) : 5);
  const [total, setTotal] = useState(0);
  const { setPostId } = useContext(PostContext);

  useEffect(() => {
    localStorage.limit = limit;
    localStorage.page = page;
  }, [limit, page]);

  useEffect(() => {
    const skip = (page - 1) * limit;
    fetch(`https://dummyjson.com/posts?&limit=${limit}&skip=${skip}`)
      .then(r => r.json())
      .then(r => {
        setPosts(r.posts);
        setTotal(r.total);
      });
  }, [page, limit]);

  const pageCount = Math.ceil(total / limit);

  function changePage(pageNumber) {
    setPage(pageNumber);
  }

  function handleChange(e) {
    setLimit(Number(e.target.value));
    setPage(1);
  }

  function handlePrevPage(e) {
    e.preventDefault();
    if ((page - 1) > 0) {
      setPage(page - 1);
    }
  }

  function handleNextPage(e) {
    e.preventDefault();
    if ((page + 1) <= pageCount) {
      setPage(page + 1);
    }
  }

  const startPage = Math.max(1, page - 4);
  const endPage = Math.min(pageCount, page + 5);

  return (
    <>
      <label className='choice'> Pieces to be shown :
        <select onChange={handleChange} value={limit} style={{
          borderRadius: '100px',
          background: 'inherit',
          marginLeft: '10px',
          color: '#FFF'
        }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select> {total > 0 && ` / ${total}`}
      </label>
      {posts.map(x =>
        <div key={x.id} className='postItem'>
          <div className="tags">
            <button>{x.tags[0]}</button>
            <button>{x.tags[1]}</button>
            <button>{x.tags[2]}</button>
          </div>
          <h2> {x.title} </h2>
          <p>{x.body}</p>
          <div className="interaction">
            <div className="InteractionsItem">
              <a href='#' onClick={(e) => e.preventDefault()}> <img src="/img/likeDetails.svg" alt="" />Like</a>
            </div>
            <div className="InteractionsItem">
              <a href='#'   onClick={e => { e.preventDefault(); setPostId(x.id)}}> <img src="/img/comment.svg" alt="" />Comment</a>
            </div>
            <div className="InteractionsItem">
              <a href='#' onClick={(e) => e.preventDefault()}> <img src="/img/return.svg" alt="" />Repost</a>
            </div>
            <div className="InteractionsItem">
              <a href='#' onClick={(e) => e.preventDefault()}> <img src="/img/share.svg" alt="" />Share</a>
            </div>
          </div>
        </div>
      )}

      {pageCount > 0 &&
        <ul className="pagination">
          <li><a href="#" onClick={handlePrevPage}>&lt;</a></li>
          {
            Array
              .from({ length: endPage - startPage + 1 }, (v, i) => (i + startPage))
              .map(x => <li key={x}><a href="#" className={page === x ? 'activePage' : ''} onClick={e => { e.preventDefault(); changePage(x); }}>{x}</a></li>)
          }
          <li><a href="#" onClick={handleNextPage}>&gt;</a></li>
        </ul>
      }
    </>
  )
}

function Comments() {
  const [comments, setComments] = useState([]);
  const { postId } = useContext(PostContext);
  const route = useContext(RouterContext);
  const [savedComments, setSavedComments] = useState(localStorage.comments ? JSON.parse(localStorage.comments) : []);

  useEffect(() => {
    if (postId && route.url === '#/posts') {
      fetch(`https://dummyjson.com/posts/${postId}/comments`)
        .then(r => r.json())
        .then(data => setComments(data.comments));
    } else {
      route.element
    }
  }, [postId, route.url]);

  function handleSubmitForm(e) {
    e.preventDefault();
    const username = e.target['username'].value;
    const userIdea = e.target['userIdea'].value;

    const newComment = {
      id: crypto.randomUUID(),
      postId: postId,
      body: userIdea,
      user: {
        username,
        fullName: username,
        id: crypto.randomUUID()
      }
    };

    setSavedComments([...savedComments, newComment]);

    e.target.reset();
  }

  useEffect(() => {
    localStorage.comments = JSON.stringify(savedComments);
  }, [savedComments]);

  const filteredSavedComments = savedComments.filter(x => x.postId === postId);
  const totalComments = [...comments, ...filteredSavedComments];

  return (
    <>
      {postId && route.url === '#/posts' ? (
        <>
          <div>
            {totalComments.map((comment, i) => (
              <div key={i} className='commentItem'><strong>{comment.user.fullName}</strong> says: {comment.body}</div>
            ))}
          </div>
          <form autoComplete='off' onSubmit={handleSubmitForm}>
            <p> <input
              name='username'
              required
              type="text"
              placeholder='Username...' /></p>
             <textarea
              name='userIdea'
              placeholder="Write your comment"
              required />
            <button className='addCommit' type="submit">Add Comment</button>
          </form>
        </>
      ) : (
        null
      )}
    </>
  )
}

function NotFound() {
  return (
    <p>Page not found. <a href="#/">return home</a></p>
  )
}

export default App
