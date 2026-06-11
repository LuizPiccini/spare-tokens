# Add thumbnails for tutorials/gallery where missing
Imported from: matplotlib-good-first-issue
Repository: matplotlib/matplotlib
Issue: #17479 https://github.com/matplotlib/matplotlib/issues/17479
Issue author: story645
Labels: Documentation, Good first issue
Created: 2020-05-21T21:50:20Z
Updated: 2026-06-08T03:25:24Z
Comments: 72
## Source Rationale
Matplotlib is a core visualization library for science, education, government, and data journalism.
Source note: Favor documentation, examples, accessibility, and small testable behavior reports.
## Issue Body Excerpt
There are a handful of gallery and tutorial examples that are missing thumbnails:
![image](https://user-images.githubusercontent.com/1300499/82606621-6115dd80-9b85-11ea-87bd-d297df516680.png)

The examples lacking thumbnails should be updated so that either:
*  A thumbnail is [chosen from the example](https://sphinx-gallery.github.io/stable/auto_examples/plot_4_choose_thumbnail.html#sphx-glr-auto-examples-plot-4-choose-thumbnail-py)
* A thumbnail is [manually set](https://sphinx-gallery.github.io/stable/auto_examples/plot_4b_provide_thumbnail.html#sphx-glr-auto-examples-plot-4b-provide-thumbnail-py) 

And yes, it's understandable that some of these don't have thumbnails, but then maybe we need a different section in the docs for non-graphical examples? 
 
This is an inventory assuming #17477 goes in & a later upgrade to sphinx 0.7.1
# Tutorials missing thumbnails:

## tutorials 
-  #31275 

## Text
- [x] https://matplotlib.org/devdocs/tutorials/text/annotations.html#sphx-glr-tutorials-text-annotations-py
- [x] https://matplotlib.org/devdocs/tutorials/text/mathtext.html#sphx-glr-tutorials-text-mathtext-py

- [ ] https://matplotlib.org/devdocs/tutorials/text/pgf.html#sphx-glr-tutorials-text-pgf-py #31224
- [ ] https://matplotlib.org/devdocs/tutorials/text/usetex.html#sphx-glr-tutorials-text-usetex-py #31224
- [ ] https://matplotlib.org/devdocs/users/explain/text/fonts.html #31224


## Toolkits
- [ ] https://matplotlib.org/devdocs/tutorials/toolkits/axes_grid.html#sphx-glr-tutorials-toolkits-axes-grid-py
- [ ] https://matplotlib.org/devdocs/tutorials/toolkits/axisartist.html#sphx-glr-tutorials-toolkits-axisartist-py
- [ ]  https://matplotlib.org/devdocs/tutorials/toolkits/mplot3d.html#sphx-glr-tutorials-toolkits-mplot3d-py

# Examples missing thumbnails
## animation
- [ ] https://matplotlib.org/devdocs/gallery/animation/frame_grabbing_sgskip.html#sphx-glr-gallery-animation-frame-grabbing-sgskip-py
## interactive
- [ ] https://matplotlib.org/devdocs/gallery/event_handling/ginput_manual_clabel_sgskip.html#sphx-glr-gallery-event-handling-ginput-manual-clabel-sgskip-py
- [ ] https://matplotlib.org/devdocs/gallery/event_handling/pong_sgskip.html#sphx-glr-gallery-event-handling-pong-sgskip-py

## misc
- [x] https://matplotlib.org/devdocs/gallery/misc/multipage_pdf.html#sphx-glr-gallery-misc-multipage-pdf-py #31308
- [ ] https://matplotlib.org/devdocs/gallery/misc/ftface_props.html#sphx-glr-gallery-misc-ftface-props-py #31321 
- [ ] https://matplotlib.org/devdocs/gallery/misc/font_indexing.html#sphx-glr-gallery-misc-font-indexing-py

### sgskip
- [ ] https://matpl

[truncated]