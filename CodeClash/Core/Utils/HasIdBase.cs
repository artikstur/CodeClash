namespace Core.Utils;

public abstract class HasIdBase<TKey> : IHasId<TKey>
    where TKey: IEquatable<TKey>
{
    public virtual TKey Id { get; set; }

    object IHasId.Id => Id;
}