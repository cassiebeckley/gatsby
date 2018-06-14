import React, { Component } from "react"
import Helmet from "react-helmet"

import { Link } from "gatsby"
import Img from "gatsby-image"
// import { style } from "glamor"
import hex2rgba from "hex2rgba"

import Layout from "../components/layout"
import SearchIcon from "../components/search-icon"
import ShowcaseNavigationMobile from "../components/showcase-navigation-mobile";
//import FuturaParagraph from "../components/futura-paragraph"
//import Container from "../components/container"
import { options, /* rhythm, */ scale, rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import MdFilterList from "react-icons/lib/md/filter-list"
import FaAngleDown from "react-icons/lib/fa/angle-down"
import FaAngleUp from "react-icons/lib/fa/angle-up"
import MdClear from "react-icons/lib/md/clear"

import Fuse from "fuse.js"
import FeaturedSitesIcon from "../assets/featured-sites-icons.svg"
import { ShowcaseIcon } from "../assets/mobile-nav-icons"

// TODO: make sure to use colors

// TODO: make sure to run Prettier before PR

const count = arrays => {
  let counts = new Map()

  for (let categories of arrays) {
    if (!categories) continue

    for (let category of categories) {
      if (!counts.has(category)) {
        counts.set(category, 0)
      }

      counts.set(category, counts.get(category) + 1)
    }
  }

  return counts
}

const filterByCategories = (list, categories) => {
  let items = list

  items = items.filter(
    ({ node }) =>
      node.categories &&
      node.categories.filter(c => categories.has(c)).length === categories.size
  )

  return items
}

// TODO: not final
const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)

  return (
    <div
      css={{
        display: `flex`,
        flexWrap: `wrap`,
        padding: rhythm(3 / 4),
      }}
    >
      {items.map(
        ({ node }) =>
          node.fields &&
          node.fields.slug && ( // have to filter out null fields from bad data
            <Link
              key={node.id}
              to={{ pathname: node.fields.slug, state: { isModal: true } }}
              css={{
                margin: rhythm(3 / 4),
                width: 280,
                "&&": {
                  borderBottom: `none`,
                  boxShadow: `none`,
                  transition: `all ${presets.animation.speedDefault} ${
                    presets.animation.curveDefault
                  }`,
                  "&:hover": {
                    ...styles.screenshotHover,
                  },
                },
              }}
            >
              {node.childScreenshot ? (
                <Img
                  resolutions={
                    node.childScreenshot.screenshotFile.childImageSharp
                      .resolutions
                  }
                  alt={`Screenshot of ${node.title}`}
                  css={{
                    ...styles.screenshot,
                  }}
                />
              ) : (
                <div
                  css={{
                    width: 320,
                    backgroundColor: `#d999e7`,
                  }}
                >
                  missing
                </div>
              )}
              {node.title}
              <div
                css={{
                  ...scale(-2 / 5),
                  color: `#9B9B9B`,
                  fontWeight: `normal`,
                }}
              >
                {node.categories && node.categories.join(`, `)}
              </div>
            </Link>
          )
      )}
    </div>
  )
}

class Collapsible extends Component {
  state = {
    collapsed: false,
  }

  handleClick = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    const { heading, children } = this.props
    return (
      <div>
        {/* TODO: onClick should be on a link or something */}
        <h4
          css={{
            color: colors.lilac,
            cursor: `pointer`,
            fontWeight: `normal`,
            fontSize: scale(-2 / 5).fontSize,
            marginTop: rhythm(options.blockMarginBottom),
            letterSpacing: `.15em`,
            textTransform: `uppercase`,
            "&:hover": {
              color: colors.gatsby,
            },
          }}
          onClick={this.handleClick}
        >
          {heading} {this.state.collapsed ? <FaAngleDown /> : <FaAngleUp />}
        </h4>
        <div
          css={{
            overflow: `hidden`,
            height: this.state.collapsed ? `0px` : `500px`,
            transition: `height 0.2s`,
          }}
        >
          <div
            css={{
              overflowY: `scroll`,
              height: `500px`,
              ...styles.scrollbar,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
}

class FilteredShowcase extends Component {
  state = {
    search: ``,
    sitesToShow: 9,
  }

  constructor(props) {
    super(props)

    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        `node.title`,
        `node.categories`,
        `node.built_by`,
        `node.description`,
      ],
    }

    this.fuse = new Fuse(props.data.allSitesYaml.edges, options)
  }

  render() {
    const { data, filters } = this.props

    let items = data.allSitesYaml.edges

    if (this.state.search.length > 0) {
      items = this.fuse.search(this.state.search)
    }

    if (filters.size > 0) {
      items = filterByCategories(items, filters)
    }

    return (
      <section
        className="showcase"
        css={{
          display: `flex`,
        }}
      >
        <div
          css={{
            display: `none`,
            [presets.Desktop]: {
              display: `block`,
              flexBasis: `15rem`,
              minWidth: `15rem`,
              ...styles.sticky,
              paddingTop: 0,
              borderRight: `1px solid ${colors.ui.light}`,
              // background: colors.ui.whisper,
              height: `calc(100vh - ${presets.headerHeight})`,
            },
          }}
        >
          <h3
            css={{
              margin: 0,
              [presets.Desktop]: {
                ...scale(1 / 8),
                lineHeight: 1,
                height: presets.headerHeight,
                margin: 0,
                color: colors.gray.calm,
                fontWeight: `normal`,
                display: `flex`,
                flexShrink: 0,
                paddingLeft: rhythm(3 / 4),
                paddingRight: rhythm(3 / 4),
                paddingTop: rhythm(options.blockMarginBottom),
                paddingBottom: rhythm(options.blockMarginBottom),
                borderBottom: `1px solid ${colors.ui.light}`,
              },
            }}
          >
            Filter & Refine{` `}
            <span css={{ marginLeft: `auto`, opacity: 0.5 }}>
              <MdFilterList />
            </span>
          </h3>
          <div
            css={{
              paddingLeft: rhythm(3 / 4),
            }}
          >
            {/* TODO: design and CSS for "Clear all filters" */}
            {filters.size > 0 && <button onClick={() => {this.props.setFilters([])}}><MdClear /> Clear all filters</button>}
            <Collapsible heading="Category">
              {Array.from(
                count(
                  data.allSitesYaml.edges.map(({ node }) => node.categories)
                )
              )
                .sort(([a], [b]) => {
                  if (a < b) return -1
                  if (a > b) return 1
                  return 0
                })
                .map(([c, count]) => (
                  <ul key={c} css={{ margin: 0 }}>
                    <button
                      className={filters.has(c) ? `selected` : ``}
                      onClick={() => {
                        if (filters.has(c)) {
                          filters.delete(c)
                          this.props.setFilters(filters)
                        } else {
                          this.props.setFilters(filters.add(c))
                        }
                      }}
                      css={{
                        background: `none`,
                        border: `none`,
                        color: colors.gray.text,
                        cursor: `pointer`,
                        display: `flex`,
                        fontFamily: options.headerFontFamily.join(`,`),
                        ...scale(-1 / 6),
                        justifyContent: `space-between`,
                        width: `100%`,
                        padding: 0,
                        paddingRight: rhythm(1),
                        paddingBottom: rhythm(options.blockMarginBottom / 8),
                        paddingTop: rhythm(options.blockMarginBottom / 8),
                        ":hover": {
                          color: colors.gatsby,
                        },
                        "&.selected": {
                          color: colors.gatsby,
                          "& .rule": { visibility: `visible` },
                        },
                      }}
                    >
                      <div>{c}</div>
                      <div
                        className="rule"
                        css={{
                          visibility: `hidden`,
                          backgroundColor: colors.gatsby,
                          width: `100%`,
                          height: `1px`,
                          margin: `10px`,
                        }}
                      />
                      <div css={{ color: colors.gray.calm }}>{count}</div>
                    </button>
                  </ul>
                ))}
            </Collapsible>
          </div>
        </div>
        <div>
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              flexDirection: `column`,
              [presets.Desktop]: {
                height: presets.headerHeight,
                flexDirection: `row`,
                alignItems: `center`,
                ...styles.sticky,
                background: `rgba(255,255,255,0.98)`,
                paddingLeft: `${rhythm(3 / 4)}`,
                paddingRight: `${rhythm(3 / 4)}`,
                paddingBottom: rhythm(options.blockMarginBottom),
                zIndex: 1,
                borderBottom: `1px solid ${colors.ui.light}`,
              },
            }}
            id="search-heading"
          >
            <h2
              css={{
                color: colors.gatsby,
                margin: 0,
                ...scale(1 / 5),
                lineHeight: 1,
              }}
            >
              {this.state.search.length === 0 ? (
                filters.size === 0 ? (
                  <span>
                    All {data.allSitesYaml.edges.length} Showcase Sites
                  </span>
                ) : (
                  <span>
                    {items.length}
                    {` `}
                    {filters.size === 1 && filters.values()[0]}
                    {` `}
                    Sites
                  </span>
                )
              ) : (
                <span>{items.length} search results</span>
              )}
            </h2>
            <div css={{ marginLeft: `auto` }}>
              <label css={{ position: `relative` }}>
                <input
                  css={{
                    border: 0,
                    borderRadius: presets.radiusLg,
                    color: colors.gatsby,
                    fontFamily: options.headerFontFamily.join(`,`),
                    paddingTop: rhythm(1 / 8),
                    paddingRight: rhythm(1 / 5),
                    paddingBottom: rhythm(1 / 8),
                    paddingLeft: rhythm(1),
                    ":focus": {
                      outline: 0,
                      backgroundColor: colors.ui.light,
                      borderRadius: presets.radiusLg,
                      transition: `width ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                      }, background-color ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                      }`,
                    },
                  }}
                  type="text"
                  value={this.state.search}
                  onChange={e =>
                    this.setState({
                      search: e.target.value,
                    })
                  }
                  placeholder="Search sites"
                  aria-label="Search sites"
                />
                <SearchIcon
                  overrideCSS={{
                    // ...iconStyles,
                    fill: colors.lilac,
                    position: `absolute`,
                    left: `5px`,
                    top: `50%`,
                    width: `16px`,
                    height: `16px`,
                    pointerEvents: `none`,
                    // transition: `fill ${speedDefault} ${curveDefault}`,
                    transform: `translateY(-50%)`,

                    // [presets.Hd]: {
                    //   fill: focussed && isHomepage && colors.gatsby,
                    // },
                  }}
                />
              </label>
            </div>
          </div>
          <ShowcaseList items={items} count={this.state.sitesToShow} />
          {this.state.sitesToShow < items.length && (
            <button
              css={{
                ...styles.button,
                marginBottom: rhythm(options.blockMarginBottom * 5),
                marginLeft: rhythm(3 / 4),
                marginRight: rhythm(3 / 4),
                marginTop: rhythm(options.blockMarginBottom * 2),
              }}
              onClick={() => {
                this.setState({ sitesToShow: this.state.sitesToShow + 15 })
              }}
            >
              Load More
              <div css={{ marginLeft: `5px`, display: `inline` }}>↓</div>
            </button>
          )}
        </div>
      </section>
    )
  }
}

class ShowcasePage extends Component {
  state = {
    filters: new Set([]),
  }

  render() {
    const data = this.props.data
    const location = this.props.location

    return (
      <Layout location={location}>
        <Helmet>
          <title>Showcase</title>
        </Helmet>
        <ShowcaseNavigationMobile />
        <section
          className="featured-sites"
          css={{
            margin: `${rhythm(options.blockMarginBottom)} ${rhythm(3 / 4)} 0`,
            position: `relative`,
          }}
        >
          <div
            css={{
              background: `url(${FeaturedSitesIcon})`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `contain`,
              position: `absolute`,
              height: `100%`,
              width: `100%`,
              left: -100,
              opacity: 0.02,
              top: 0,
              zIndex: -1,
            }}
          />
          <div
            css={{
              marginBottom: rhythm(options.blockMarginBottom * 2),
              [presets.Mobile]: {
                display: `flex`,
                alignItems: `center`,
              },
            }}
          >
            <img src={FeaturedSitesIcon} alt="icon" css={{ marginBottom: 0 }} />
            <h1
              css={{
                ...scale(1 / 5),
                color: colors.gatsby,
                fontFamily: options.headerFontFamily.join(`,`),
                fontWeight: `bold`,
                marginRight: 30,
                marginLeft: 15,
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Featured Sites
            </h1>
            <a
              href="#search-heading"
              css={{
                "&&": {
                  ...scale(-1 / 6),
                  boxShadow: `none`,
                  borderBottom: 0,
                  color: colors.lilac,
                  cursor: `pointer`,
                  fontFamily: options.headerFontFamily.join(`,`),
                  fontWeight: `normal`,
                },
              }}
              onClick={() => this.setState({ filters: new Set([`Featured`]) })}
            >
              View all&nbsp;<span css={{ marginLeft: `5px` }}>→</span>
            </a>
            <div
              css={{
                display: `flex`,
                alignItems: `center`,
                marginLeft: `auto`,
              }}
            >
              <div
                css={{
                  ...scale(-1 / 6),
                  color: colors.gray.calm,
                  marginRight: 15,
                  fontFamily: options.headerFontFamily.join(`,`),
                  display: `none`,
                  [presets.Tablet]: {
                    display: `block`,
                  },
                }}
              >
                Want to get featured?
              </div>
              {/* TODO: maybe have a site submission issue template */}
              <a
                href="https://github.com/gatsbyjs/gatsby/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                css={{
                  ...styles.button,
                }}
              >
                Submit{` `}
                <span
                  css={{
                    display: `none`,
                    [presets.Desktop]: {
                      display: `inline`,
                    },
                  }}
                >
                  your{` `}
                </span>Site
                <div css={{ marginLeft: `5px`, display: `inline` }}>→</div>
              </a>
            </div>
          </div>
          <div
            css={{
              position: `relative`,
            }}
          >
            <div
              css={{
                display: `flex`,
                overflowX: `scroll`,
                flexShrink: 0,
                margin: `0 -${rhythm(3 / 4)}`,
                padding: `3px ${rhythm(3 / 4)} 0`,
                ...styles.scrollbar,
              }}
            >
              {data.featured.edges.slice(0, 9).map(({ node }) => (
                <Link
                  key={node.id}
                  css={{
                    ...styles.featuredSitesCard,
                    "&&": {
                      borderBottom: `none`,
                      boxShadow: `none`,
                      transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
                      "&:hover": {
                        ...styles.screenshotHover,
                      },
                    },
                  }}
                  to={{
                    pathname: node.fields && node.fields.slug,
                    state: { isModal: true },
                  }}
                >
                  {node.childScreenshot && (
                    <Img
                      sizes={
                        node.childScreenshot.screenshotFile.childImageSharp
                          .sizes
                      }
                      alt={node.title}
                      css={{
                        ...styles.screenshot,
                      }}
                    />
                  )}
                  {node.title}
                  <div
                    css={{
                      ...scale(-1 / 6),
                      color: colors.gray.calm,
                      fontWeight: `normal`,
                      [presets.Desktop]: {
                        marginTop: `auto`,
                      },
                    }}
                  >
                    {node.built_by && <div>Built by {node.built_by}</div>}
                    <div css={{ opacity: 0.5 }}>
                      {node.categories && node.categories.join(`, `)}
                    </div>
                  </div>
                </Link>
              ))}
              <a
                href="#search-heading"
                css={{
                  ...styles.featuredSitesCard,
                  textAlign: `center`,
                  border: `1px solid ${hex2rgba(colors.lilac, 0.2)}`,
                  borderRadius: presets.radius,
                  "&&": {
                    boxShadow: `none`,
                    transition: `all ${presets.animation.speedDefault} ${
                      presets.animation.curveDefault
                    }`,
                    "&:hover": {
                      backgroundColor: hex2rgba(colors.ui.light, 0.25),
                      transform: `translateY(-3px)`,
                      boxShadow: `0 8px 20px ${hex2rgba(colors.lilac, 0.5)}`,
                    },
                  },
                }}
                onClick={() => {
                  this.setState({ filters: new Set([`Featured`]) })
                }}
              >
                <div
                  css={{
                    margin: rhythm(1),
                    background: colors.ui.whisper,
                    display: `flex`,
                    alignItems: `center`,
                    position: `relative`,
                    flexBasis: `100%`,
                  }}
                >
                  <img
                    src={ShowcaseIcon}
                    css={{
                      position: `absolute`,
                      height: `100%`,
                      width: `auto`,
                      display: `block`,
                      margin: `0`,
                      opacity: 0.04,
                    }}
                    alt=""
                  />
                  <span
                    css={{
                      margin: `0 auto`,
                      color: colors.gatsby,
                    }}
                  >
                    <img
                      src={ShowcaseIcon}
                      css={{
                        height: 44,
                        width: `auto`,
                        display: `block`,
                        margin: `0 auto ${rhythm(options.blockMarginBottom)}`,
                        [presets.Tablet]: {
                          height: 64,
                        },
                        [presets.Hd]: {
                          height: 72,
                        },
                      }}
                      alt=""
                    />
                    View all Featured Sites
                  </span>
                </div>
              </a>
            </div>
            <div
              css={{
                position: `absolute`,
                top: `0`,
                bottom: rhythm(options.blockMarginBottom),
                right: `-${rhythm(3 / 4)}`,
                width: `60px`,
                pointerEvents: `none`,
                background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,1) 100%)`,
              }}
            />
          </div>
        </section>
        <FilteredShowcase
          data={data}
          filters={this.state.filters}
          setFilters={filters => this.setState({ filters })}
        />
      </Layout>
    )
  }
}

export default ShowcasePage

export const showcaseQuery = graphql`
  query ShowcaseQuery {
    featured: allSitesYaml(filter: { featured: { eq: true } }) {
      edges {
        node {
          id
          title
          categories
          built_by

          fields {
            slug
          }

          childScreenshot {
            screenshotFile {
              childImageSharp {
                sizes(maxWidth: 512) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
        }
      }
    }
    allSitesYaml(filter: { main_url: { ne: null } }) {
      edges {
        node {
          id
          featured

          title
          categories
          built_by
          description

          main_url
          built_by_url

          childScreenshot {
            screenshotFile {
              childImageSharp {
                resolutions(width: 282, height: 211) {
                  ...GatsbyImageSharpResolutions
                }
              }
            }
          }
          fields {
            slug
          }
        }
      }
    }
  }
`

const styles = {
  featuredSitesCard: {
    display: `flex`,
    flexDirection: `column`,
    flexGrow: 0,
    flexShrink: 0,
    width: 320,
    marginBottom: rhythm(options.blockMarginBottom * 2),
    marginRight: rhythm(3 / 4),
    [presets.Hd]: {
      width: 360,
      marginRight: rhythm(6 / 4),
    },
    [presets.VHd]: {
      width: 400,
    },
  },
  button: {
    border: 0,
    borderRadius: presets.radius,
    cursor: `pointer`,
    fontFamily: options.headerFontFamily.join(`,`),
    fontWeight: `bold`,
    padding: `${rhythm(1 / 5)} ${rhythm(2 / 3)}`,
    WebkitFontSmoothing: `antialiased`,
    "&&": {
      backgroundColor: colors.gatsby,
      borderBottom: `none`,
      boxShadow: `none`,
      color: `white`,
      "&:hover": {
        backgroundColor: colors.gatsby,
      },
    },
  },
  sticky: {
    paddingTop: rhythm(options.blockMarginBottom),
    position: `sticky`,
    top: `calc(${presets.headerHeight} - 1px)`,
  },
  scrollbar: {
    WebkitOverflowScrolling: `touch`,
    "&::-webkit-scrollbar": {
      width: `6px`,
      height: `6px`,
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.ui.bright,
    },
    "&::-webkit-scrollbar-track": {
      background: colors.ui.light,
    },
  },
  screenshot: {
    borderRadius: presets.radius,
    boxShadow: `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
    marginBottom: rhythm(options.blockMarginBottom / 2),
    transition: `all ${presets.animation.speedDefault} ${
      presets.animation.curveDefault
    }`,
  },
  screenshotHover: {
    background: `transparent`,
    color: colors.gatsby,
    "& .gatsby-image-wrapper": {
      transform: `translateY(-3px)`,
      boxShadow: `0 8px 20px ${hex2rgba(colors.lilac, 0.5)}`,
    },
  },
}
