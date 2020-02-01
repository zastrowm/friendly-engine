let hotModuleHelper = {
  componentWillLoad: function(hostElement: any, instance: any) {
    if (hostElement.__prexisting != null) {
      hostElement.__prexisting.componentDidUnload();
    }

    hostElement.__prexisting = instance;
  },

  componentDidUnload: function(hostElement: any) {
    hostElement.__prexisting = null;
  },
};

export default hotModuleHelper;
