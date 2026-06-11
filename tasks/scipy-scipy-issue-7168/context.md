# DOC: Add "Examples" to docstrings
Imported from: scipy-good-first-issue
Repository: scipy/scipy
Issue: #7168 https://github.com/scipy/scipy/issues/7168
Issue author: WarrenWeckesser
Labels: task, Documentation, good first issue
Created: 2017-03-14T03:37:05Z
Updated: 2026-06-11T02:38:12Z
Comments: 81
## Source Rationale
SciPy underpins scientific computing, engineering, education, and research workflows across many public-good domains.
Source note: Favor tasks with small reproductions, benchmark evidence, documentation gaps, or targeted tests.
## Issue Body Excerpt
Many of the functions in scipy do not include examples in their docstrings.  Even a simple example can be helpful for a new user, so we should try to include examples wherever possible.

A script called `find_functions_missing_examples.py` is now maintained in my github repository [`analyze-scipy-code`](https://github.com/WarrenWeckesser/analyze-scipy-code).  This script reports the names of functions that are missing the "Examples" section.

Below is the output that I get when run with the current master branch.  Some of these functions have proper docstrings, so all they need is the addition of an "Examples" section containing one or more illustrative examples.  Many of them, however, do not comply with the [numpy docstring guidelines](https://github.com/numpy/numpy/blob/master/doc/HOWTO_DOCUMENT.rst.txt), and may be missing the "Parameters" and "Returns" sections.  In particular, the docstrings of many of the functions in `scipy.special` are quite terse.  Anyone who works on this task should ensure that the final docstring complies with the guidelines.  See, for example, https://github.com/scipy/scipy/pull/7148, where the sections "Parameters", "Returns" and "Examples" were added to the docstring of `scipy.special.gamma`.

I have added the tag "good first issue" to this task, because it is usually very easy to add one or two examples to a function.  (How to edit the docstring of the functions in `scipy.special` is not obvious, but take a look at https://github.com/scipy/scipy/pull/7148 or https://github.com/scipy/scipy/pull/7143 for examples.)  The tag does not mean it will be easy to complete this task.  As you can see below, there is a lot of work to be done!   Anyone who wants to help should feel free to pick a function or two to work on.

The script ignores functions that have the string "is deprecated" in their docstring.  The names of other functions that should be ignored can be added to the list `skip`.  If you find such a function, add a comment about it here.

Functions missing "Examples", not including `fftpack` and `stats.mstats` (last updated 10-June-2026):

```
scipy version 1.19.0.dev0+git20260610.357c082

cluster.vq (1)
    py_vq
fft (2)
    ihfft2
    irfft2
interpolate (2)
    make_splprep
    make_splrep
linalg.interpolative (9)
    estimate_rank
    estimate_spectral_norm
    estimate_spectral_norm_diff
    id_to_svd
    interp_decomp
    reconstruct_interp_matrix
    reconstruct_matrix_from_id
    reconstruct_skel_matrix
    svd
ndimage (4)
    generic_gradient_magnitude
    generic_laplace
    morphological_laplace
    watershed_

[truncated]